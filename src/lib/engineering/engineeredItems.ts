import type { EngineeredSpecKind, FeederInputs } from "./types";

export interface EngineeredSpecResult {
  /** Human-readable description built from the engineer-supplied data. */
  description: string;
  /** Structured specification stored in the engineering model. */
  spec: Record<string, unknown>;
  /** Labels of mandatory engineering inputs that were not supplied. */
  missing: string[];
}

const has = (v: unknown) => v !== null && v !== undefined && v !== "" && !(typeof v === "number" && !Number.isFinite(v));

/**
 * Builds the specification of a project-engineered instrument transformer
 * (phase CT, CBCT or VT/PT) purely from the engineering inputs.
 * No material code, MLFB or vendor data is ever invented here.
 */
export function buildEngineeredSpec(kind: EngineeredSpecKind, i: FeederInputs): EngineeredSpecResult {
  const missing: string[] = [];

  if (kind === "PHASE_CT") {
    if (!has(i.phaseCtPrimary)) missing.push("Phase CT primary current (A)");
    if (!has(i.phaseCtSecondary)) missing.push("Phase CT secondary current (A)");
    const isPs = String(i.phaseCtClass ?? "").toUpperCase().includes("PS");
    if (isPs && !has(i.phaseCtVk)) missing.push("Phase CT knee point voltage Vk (V) — required for PS class");
    if (isPs && !has(i.phaseCtRct)) missing.push("Phase CT secondary resistance Rct (ohm) — required for PS class");
    const spec = {
      itemType: "PHASE_CT",
      ratio: has(i.phaseCtPrimary) && has(i.phaseCtSecondary) ? `${i.phaseCtPrimary}/${i.phaseCtSecondary} A` : null,
      primaryA: i.phaseCtPrimary ?? null,
      secondaryA: i.phaseCtSecondary ?? null,
      accuracyClass: i.phaseCtClass || null,
      burdenVa: i.phaseCtVa ?? null,
      kneePointV: i.phaseCtVk ?? null,
      rctOhm: i.phaseCtRct ?? null,
      quantity: i.phaseCtQuantity ?? null,
    };
    return {
      spec,
      missing,
      description: `Phase CT (engineered item) ${spec.ratio ?? "ratio not specified"}${
        spec.accuracyClass ? `, class ${spec.accuracyClass}` : ""
      }${spec.burdenVa ? `, ${spec.burdenVa} VA` : ""}${spec.kneePointV ? `, Vk ${spec.kneePointV} V` : ""}${
        spec.rctOhm ? `, Rct ${spec.rctOhm} ohm` : ""
      }`,
    };
  }

  if (kind === "CBCT") {
    if (!has(i.cbctPrimary)) missing.push("CBCT primary current (A)");
    if (!has(i.cbctSecondary)) missing.push("CBCT secondary current (A)");
    const spec = {
      itemType: "CBCT",
      ratio: has(i.cbctPrimary) && has(i.cbctSecondary) ? `${i.cbctPrimary}/${i.cbctSecondary} A` : null,
      primaryA: i.cbctPrimary ?? null,
      secondaryA: i.cbctSecondary ?? null,
      accuracyClass: i.cbctClass || null,
      burdenVa: i.cbctVa ?? null,
    };
    return {
      spec,
      missing,
      description: `Core balance CT (engineered item) ${spec.ratio ?? "ratio not specified"}${
        spec.accuracyClass ? `, class ${spec.accuracyClass}` : ""
      }${spec.burdenVa ? `, ${spec.burdenVa} VA` : ""}`,
    };
  }

  if (!has(i.vtRatio)) missing.push("VT / PT ratio");
  const spec = {
    itemType: "VT",
    ratio: i.vtRatio || null,
    accuracyClass: i.vtClass || null,
    burdenVa: i.vtVa ?? null,
    frequencyHz: i.vtFrequencyHz ?? i.frequencyHz ?? null,
  };
  return {
    spec,
    missing,
    description: `Voltage transformer (engineered item) ${spec.ratio ?? "ratio not specified"}${
      spec.accuracyClass ? `, class ${spec.accuracyClass}` : ""
    }${spec.burdenVa ? `, ${spec.burdenVa} VA` : ""}${spec.frequencyHz ? `, ${spec.frequencyHz} Hz` : ""}`,
  };
}

/**
 * Engineering inputs the current scheme requires before BOM / schematic
 * generation is allowed. Returns a list of human-readable missing items.
 */
export function missingInstrumentTransformerInputs(i: FeederInputs): string[] {
  const missing: string[] = [];
  if (ctRequired(i)) missing.push(...buildEngineeredSpec("PHASE_CT", i).missing);
  if (cbctRequired(i)) missing.push(...buildEngineeredSpec("CBCT", i).missing);
  if (vtRequired(i)) missing.push(...buildEngineeredSpec("VT", i).missing);
  return missing;
}

export function ctRequired(i: FeederInputs): boolean {
  const pf = i.protectionFunctions ?? [];
  return pf.length > 0 || i.meteringRequired === true;
}

export function cbctRequired(i: FeederInputs): boolean {
  const pf = i.protectionFunctions ?? [];
  return pf.some((f) => ["50N", "51N", "67N"].includes(f)) && i.earthFaultSource === "CBCT";
}

export function vtRequired(i: FeederInputs): boolean {
  return i.residualVoltageSource === "PANEL_VT_OPEN_DELTA";
}
