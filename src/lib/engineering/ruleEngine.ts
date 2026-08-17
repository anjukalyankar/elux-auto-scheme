import type {
  EngineeringModel,
  EngineeringRule,
  FeederInputs,
  Issue,
  Material,
  MaterialSelector,
  ModelComponent,
  RuleAction,
  RuleCondition,
  RuleConditionGroup,
  RuleResult,
  SymbolDef,
  TerminalTemplate,
} from "./types";
import { buildConnections } from "./connections";
import { buildEngineeredSpec } from "./engineeredItems";


/* -------- helpers -------- */

function resolveRef(value: unknown, inputs: FeederInputs): unknown {
  if (typeof value === "string" && value.startsWith("$")) {
    return inputs[value.slice(1)];
  }
  return value;
}

function looseEq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || a === undefined || b === null || b === undefined) return false;
  if (typeof a === "number" || typeof b === "number") return Number(a) === Number(b);
  return String(a).toUpperCase() === String(b).toUpperCase();
}

function isCondition(node: RuleCondition | RuleConditionGroup): node is RuleCondition {
  return typeof (node as RuleCondition).field === "string";
}

function evalCondition(cond: RuleCondition, inputs: FeederInputs): boolean {
  const left = inputs[cond.field];
  const right = resolveRef(cond.value, inputs);
  switch (cond.op) {
    case "eq":
      return looseEq(left, right);
    case "neq":
      return !looseEq(left, right);
    case "gt":
      return Number(left) > Number(right);
    case "gte":
      return Number(left) >= Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "lte":
      return Number(left) <= Number(right);
    case "in":
      return Array.isArray(right) && right.some((v) => looseEq(left, v));
    case "includes":
      return Array.isArray(left) && left.some((v) => looseEq(v, right));
    case "includes_any":
      return (
        Array.isArray(left) &&
        Array.isArray(right) &&
        right.some((r) => (left as unknown[]).some((v) => looseEq(v, r)))
      );
    case "exists":
      return left !== null && left !== undefined && left !== "" && !(Array.isArray(left) && left.length === 0);
    case "not_empty":
      return Array.isArray(left) ? left.length > 0 : left !== null && left !== undefined && left !== "";
    case "neq_field":
      return !looseEq(left, inputs[String(cond.value)]);
    default:
      return false;
  }
}

function evalGroup(group: RuleConditionGroup, inputs: FeederInputs): boolean {
  const all = group.all ?? [];
  const any = group.any ?? [];
  const allOk = all.every((n) => (isCondition(n) ? evalCondition(n, inputs) : evalGroup(n, inputs)));
  const anyOk = any.length === 0 || any.some((n) => (isCondition(n) ? evalCondition(n, inputs) : evalGroup(n, inputs)));
  return allOk && anyOk;
}

/* -------- material selection -------- */

export function selectMaterial(
  selector: MaterialSelector,
  inputs: FeederInputs,
  materials: Material[],
): { material: Material | null; reason: string } {
  let pool = materials.filter((m) => m.active);

  if (selector.code) {
    const code = String(resolveRef(selector.code, inputs) ?? "");
    const found = pool.find((m) => m.material_code === code) ?? null;
    return { material: found, reason: found ? "" : `No material with code ${code || "(none)"}` };
  }
  if (selector.category) pool = pool.filter((m) => m.category === selector.category);
  if (pool.length === 0) return { material: null, reason: `No material in category ${selector.category}` };

  if (selector.match) {
    for (const [key, raw] of Object.entries(selector.match)) {
      const expected = resolveRef(raw, inputs);
      if (expected === null || expected === undefined || expected === "") {
        return { material: null, reason: `Engineering input required for "${String(raw)}"` };
      }
      pool = pool.filter((m) => looseEq(m.attributes?.[key], expected));
      if (pool.length === 0) {
        return { material: null, reason: `No material with ${key} = ${String(expected)}` };
      }
    }
  }

  if (selector.gte) {
    const threshold = Number(inputs[selector.gte.field]);
    if (!Number.isFinite(threshold)) {
      return { material: null, reason: `Engineering input required: ${selector.gte.field}` };
    }
    pool = pool.filter((m) => Number(m.attributes?.[selector.gte!.attr]) >= threshold);
    if (pool.length === 0) {
      return { material: null, reason: `No material with ${selector.gte.attr} >= ${threshold}` };
    }
  }

  if (selector.unique && pool.length > 1) {
    return {
      material: null,
      reason: `ENGINEER REVIEW REQUIRED: ${pool.length} materials match this specification (${pool
        .map((m) => m.material_code)
        .join(", ")}). Selection is ambiguous.`,
    };
  }

  if (selector.sortBy) {
    const key = selector.sortBy;
    pool = [...pool].sort((a, b) => Number(a.attributes?.[key] ?? 0) - Number(b.attributes?.[key] ?? 0));
  }

  return { material: pool[0] ?? null, reason: pool[0] ? "" : "No matching material" };
}


/* -------- engine -------- */

export interface RunResult {
  model: EngineeringModel;
  ruleResults: RuleResult[];
  issues: Issue[];
}

export interface RunContext {
  inputs: FeederInputs;
  rules: EngineeringRule[];
  materials: Material[];
  terminalTemplates: TerminalTemplate[];
  symbols: SymbolDef[];
  project: { name: string; panelNumber: string; revision: string };
}

export function runEngineering(ctx: RunContext): RunResult {
  const { inputs, materials, terminalTemplates, project } = ctx;
  const issues: Issue[] = [];
  const ruleResults: RuleResult[] = [];
  const components: ModelComponent[] = [];
  const sections = new Set<string>();
  const connectionGroups = new Set<string>();
  const notes: string[] = [];
  const nodes: EngineeringModel["nodes"] = [];
  const tagCount = new Map<string, number>();

  const rules = [...ctx.rules]
    .filter((r) => r.active)
    .filter((r) => r.design_options.includes(inputs.designOption))
    .sort((a, b) => a.priority - b.priority);

  // Rule conflict detection: two active rules producing the same tag in the same section
  const tagOwners = new Map<string, string>();

  for (const rule of rules) {
    let fired = false;
    try {
      fired = evalGroup(rule.conditions ?? { all: [] }, inputs);
    } catch {
      issues.push({
        severity: "ERROR",
        code: "RULE_EVALUATION_FAILED",
        message: `Rule ${rule.rule_code} could not be evaluated. Engineering review required.`,
        source: rule.rule_code,
      });
    }

    const actionLog: string[] = [];
    if (fired) {
      for (const action of rule.actions ?? []) {
        applyAction(action, rule, actionLog);
      }
    }

    ruleResults.push({
      ruleCode: rule.rule_code,
      name: rule.name,
      category: rule.category,
      fired,
      reason: fired ? "Conditions satisfied" : "Conditions not satisfied",
      actions: actionLog,
    });
  }

  function applyAction(action: RuleAction, rule: EngineeringRule, log: string[]) {
    switch (action.type) {
      case "ENABLE_SECTION":
        if (action.section) {
          sections.add(action.section);
          log.push(`Enabled section ${action.section}`);
        }
        break;
      case "ADD_CONNECTION_GROUP":
        if (action.group) {
          connectionGroups.add(action.group);
          log.push(`Enabled connection group ${action.group}`);
        }
        break;
      case "ADD_MODEL_NODE":
        nodes.push({
          nodeType: action.nodeType ?? "NODE",
          tag: action.tag ?? "N",
          section: action.section ?? "POWER",
          symbolId: action.symbolId ?? "",
          label: action.label ?? action.tag ?? "",
        });
        if (action.section) sections.add(action.section);
        log.push(`Added ${action.nodeType} ${action.tag}`);
        break;
      case "NOTE":
        if (action.message) {
          notes.push(action.message);
          issues.push({ severity: "INFO", code: "NOTE", message: action.message, source: rule.rule_code });
          log.push("Engineering note recorded");
        }
        break;
      case "REQUIRE_INPUT": {
        const val = action.field ? inputs[action.field] : undefined;
        if (val === undefined || val === null || val === "") {
          issues.push({
            severity: "ERROR",
            code: "INPUT_REQUIRED",
            message: action.message ?? "Engineering input required.",
            source: rule.rule_code,
          });
          log.push("Engineering input required");
        }
        break;
      }
      case "WARN":
        issues.push({
          severity: "WARNING",
          code: action.code ?? "WARNING",
          message: action.message ?? "Engineering review required.",
          source: rule.rule_code,
        });
        log.push("Warning raised");
        break;
      case "ERROR":
        issues.push({
          severity: "ERROR",
          code: action.code ?? "ERROR",
          message: action.message ?? "Engineering review required.",
          source: rule.rule_code,
        });
        log.push("Error raised");
        break;
      case "ADD_ENGINEERED_ITEM": {
        const section = action.section ?? "GENERAL";
        sections.add(section);
        const tag = action.tag ?? "X";
        const kind = action.spec ?? "PHASE_CT";
        const { description, spec, missing } = buildEngineeredSpec(kind, inputs);

        for (const field of missing) {
          issues.push({
            severity: "ERROR",
            code: "ENGINEERING_INPUT_REQUIRED",
            message: `ENGINEER REVIEW REQUIRED: ${tag} (${action.function ?? kind}) — engineering input missing: ${field}.`,
            source: rule.rule_code,
          });
        }

        const template = action.terminalTemplateId
          ? terminalTemplates.find((t) => t.template_id === action.terminalTemplateId)
          : undefined;

        components.push({
          componentId: `${rule.rule_code}:${tag}`,
          tag,
          function: action.function ?? "",
          location: action.location ?? "",
          section,
          quantity: action.quantity ?? 1,
          materialId: null,
          materialCode: null,
          description,
          manufacturer: null,
          model: null,
          unit: "NOS",
          unitPrice: null,
          symbolId: action.symbolId ?? null,
          terminalTemplateId: action.terminalTemplateId ?? null,
          terminals: template?.terminals ?? [],
          properties: spec,
          ruleCode: rule.rule_code,
          engineered: true,
          spec,
          ...(missing.length > 0 ? { unresolved: `Missing engineering input: ${missing.join("; ")}` } : {}),
        });
        log.push(missing.length === 0 ? `Engineered item ${tag}: ${description}` : `Engineered item ${tag} incomplete`);
        break;
      }

      case "ADD_COMPONENT": {
        const section = action.section ?? "GENERAL";
        sections.add(section);
        const baseTag = action.tag ?? "X";
        const seen = tagCount.get(baseTag) ?? 0;
        tagCount.set(baseTag, seen + 1);
        const tag = seen === 0 ? baseTag : `${baseTag}.${seen + 1}`;

        const owner = tagOwners.get(tag);
        if (owner && owner !== rule.rule_code) {
          issues.push({
            severity: "WARNING",
            code: "RULE_CONFLICT",
            message: `Rule conflict detected: rules ${owner} and ${rule.rule_code} both produce tag ${tag}.`,
            source: rule.rule_code,
          });
        }
        tagOwners.set(tag, rule.rule_code);

        const { material, reason } = action.select
          ? selectMaterial(action.select, inputs, materials)
          : { material: null, reason: "No selector defined" };

        if (!material) {
          issues.push({
            severity: "ERROR",
            code: "MATERIAL_NOT_RESOLVED",
            message: `Engineering review required: ${action.function ?? tag} could not be resolved (${reason}).`,
            source: rule.rule_code,
          });
        }

        const template = material?.terminal_template_id
          ? terminalTemplates.find((t) => t.template_id === material.terminal_template_id)
          : undefined;

        components.push({
          componentId: `${rule.rule_code}:${tag}`,
          tag,
          function: action.function ?? "",
          location: action.location ?? "",
          section,
          quantity: action.quantity ?? 1,
          materialId: material?.id ?? null,
          materialCode: material?.material_code ?? null,
          description: material?.description ?? `UNRESOLVED - ${action.function ?? tag}`,
          manufacturer: material?.manufacturer ?? null,
          model: material?.model ?? null,
          unit: material?.unit ?? "NOS",
          unitPrice: material?.unit_price ?? null,
          symbolId: material?.symbol_id ?? null,
          terminalTemplateId: material?.terminal_template_id ?? null,
          terminals: template?.terminals ?? [],
          properties: material?.attributes ?? {},
          ruleCode: rule.rule_code,
          ...(material ? {} : { unresolved: reason }),
        });
        log.push(material ? `Added ${tag} -> ${material.material_code}` : `Unresolved ${tag}`);
        break;
      }
    }
  }

  const model: EngineeringModel = {
    generatedAt: new Date().toISOString(),
    project,
    feeder: inputs,
    sections: [...sections],
    connectionGroups: [...connectionGroups],
    components,
    connections: [],
    nodes,
    notes,
  };

  model.connections = buildConnections(model);

  return { model, ruleResults, issues };
}
