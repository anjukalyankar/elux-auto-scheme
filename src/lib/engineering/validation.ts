import { NEG_RAIL, POS_RAIL } from "./connections";
import type { Bom, EngineeringModel, Issue } from "./types";

export interface ValidationReport {
  bom: Issue[];
  schematic: Issue[];
  errorCount: number;
  warningCount: number;
  approvable: boolean;
  runAt: string;
}

/** BOM validation - runs before any export or engineering approval. */
export function validateBom(model: EngineeringModel, bom: Bom): Issue[] {
  const issues: Issue[] = [];
  const push = (severity: Issue["severity"], code: string, message: string, source = "BOM") =>
    issues.push({ severity, code, message, source });

  for (const c of model.components) {
    if (!c.materialCode) {
      push("ERROR", "MISSING_MATERIAL", `${c.tag} (${c.function}): no material resolved. ${c.unresolved ?? ""}`.trim(), c.ruleCode);
    }
    if (c.materialCode && (c.unitPrice === null || c.unitPrice === undefined)) {
      push("WARNING", "MISSING_PRICE", `${c.materialCode} has no unit price in the material master.`, c.ruleCode);
    }
    if (!Number.isFinite(c.quantity) || c.quantity <= 0) {
      push("ERROR", "INVALID_QUANTITY", `${c.tag}: invalid quantity ${c.quantity}.`, c.ruleCode);
    }
    if (c.materialCode && !c.symbolId) {
      push("WARNING", "MISSING_SYMBOL", `${c.materialCode} has no symbol assigned in the symbol master.`, c.ruleCode);
    }
    if (c.materialCode && !c.terminalTemplateId) {
      push("WARNING", "MISSING_TERMINAL_TEMPLATE", `${c.materialCode} has no terminal template assigned.`, c.ruleCode);
    }
  }

  // duplicate tags
  const tags = new Map<string, number>();
  for (const c of model.components) tags.set(c.tag, (tags.get(c.tag) ?? 0) + 1);
  for (const [tag, count] of tags) {
    if (count > 1) push("ERROR", "DUPLICATE_TAG", `Tag ${tag} is used by ${count} components.`);
  }

  // required protection components
  const pf = model.feeder.protectionFunctions ?? [];
  const needsEarthCt = pf.some((f) => ["50N", "51N", "67N"].includes(f));
  const hasEarthCt = model.components.some((c) => c.tag.startsWith("CBCT"));
  if (needsEarthCt && !hasEarthCt && model.feeder.earthFaultSource === "CBCT") {
    push("ERROR", "MISSING_PROTECTION_COMPONENT", "Earth-fault protection selected with CBCT philosophy but no CBCT is present in the model.");
  }
  if (!model.components.some((c) => c.tag === "K1")) {
    push("ERROR", "MISSING_PROTECTION_COMPONENT", "No protection relay present in the engineering model.");
  }
  if (!model.components.some((c) => c.tag === "52")) {
    push("ERROR", "MISSING_PROTECTION_COMPONENT", "No circuit breaker present in the engineering model.");
  }
  if (bom.lines.length === 0) push("ERROR", "EMPTY_BOM", "The BOM is empty.");

  return issues;
}

/** Schematic validation - runs before drawing export. */
export function validateSchematic(model: EngineeringModel): Issue[] {
  const issues: Issue[] = [];
  const push = (severity: Issue["severity"], code: string, message: string) =>
    issues.push({ severity, code, message, source: "SCHEMATIC" });

  const connected = new Set<string>();
  for (const w of model.connections) {
    connected.add(`${w.from.componentId}:${w.from.terminal}`);
    connected.add(`${w.to.componentId}:${w.to.terminal}`);
  }

  const criticalGroups = ["SUPPLY", "TRIP", "CLOSE", "CURRENT"];
  for (const c of model.components) {
    if (c.terminals.length === 0) continue;
    const unconnected = c.terminals.filter(
      (t) => criticalGroups.includes(t.group) && !connected.has(`${c.componentId}:${t.id}`),
    );
    if (unconnected.length > 0) {
      push(
        "WARNING",
        "UNCONNECTED_TERMINAL",
        `${c.tag} (${c.materialCode ?? "unresolved"}): unconnected terminals ${unconnected.map((t) => t.label).join(", ")}.`,
      );
    }
  }

  const hasWire = (section: string) => model.connections.some((w) => w.section === section);
  if (model.feeder.tripCircuitRequired && !hasWire("TRIP")) push("ERROR", "MISSING_TRIP_CIRCUIT", "Trip circuit is required but no trip wiring was generated.");
  if (model.feeder.closeCircuitRequired && !hasWire("CLOSE")) push("ERROR", "MISSING_CLOSE_CIRCUIT", "Close circuit is required but no close wiring was generated.");
  if (!hasWire("CONTROL_SUPPLY")) push("ERROR", "MISSING_CONTROL_SUPPLY", "No control supply circuit present in the schematic.");
  if (!hasWire("CT")) push("ERROR", "MISSING_CT_CONNECTION", "No CT circuit present in the schematic.");
  if (model.components.some((c) => c.tag.startsWith("CBCT")) && !hasWire("EARTH_FAULT")) {
    push("ERROR", "MISSING_CBCT_CONNECTION", "CBCT is present but not connected to the relay earth-current input.");
  }
  if (model.components.some((c) => c.tag.startsWith("HL")) && !hasWire("INDICATION")) {
    push("ERROR", "MISSING_INDICATION_CONNECTION", "Indication lamps are present but not wired.");
  }
  const relay = model.components.find((c) => c.tag === "K1");
  if (relay && !model.connections.some((w) => w.from.componentId === relay.componentId || w.to.componentId === relay.componentId)) {
    push("ERROR", "MISSING_RELAY_INPUT", "The protection relay has no connections.");
  }
  for (const c of model.components) {
    if (!c.symbolId) push("WARNING", "MISSING_COMPONENT_SYMBOL", `${c.tag} has no schematic symbol.`);
  }
  const rails = model.connections.filter((w) => [POS_RAIL, NEG_RAIL].includes(w.from.componentId) || [POS_RAIL, NEG_RAIL].includes(w.to.componentId));
  if (rails.length === 0) push("WARNING", "NO_SUPPLY_RAIL", "No wiring is referenced to the control supply rails.");

  return issues;
}

export function buildValidationReport(model: EngineeringModel, bom: Bom, ruleIssues: Issue[]): ValidationReport {
  const bomIssues = [...ruleIssues, ...validateBom(model, bom)];
  const schematicIssues = validateSchematic(model);
  const all = [...bomIssues, ...schematicIssues];
  const errorCount = all.filter((i) => i.severity === "ERROR").length;
  const warningCount = all.filter((i) => i.severity === "WARNING").length;
  return {
    bom: bomIssues,
    schematic: schematicIssues,
    errorCount,
    warningCount,
    approvable: errorCount === 0,
    runAt: new Date().toISOString(),
  };
}
