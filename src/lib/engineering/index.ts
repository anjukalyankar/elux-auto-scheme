import { generateBom } from "./bom";
import { runEngineering, type RunContext } from "./ruleEngine";
import { generateSchematic } from "./schematic";
import { buildValidationReport, type ValidationReport } from "./validation";
import type { Bom, EngineeringModel, Issue, RuleResult } from "./types";
import type { SchematicDoc } from "./schematic";

export * from "./types";
export { runEngineering, selectMaterial } from "./ruleEngine";
export { generateBom, bomToCsv } from "./bom";
export { generateSchematic } from "./schematic";
export { validateBom, validateSchematic, buildValidationReport } from "./validation";
export type { SchematicDoc, SchematicSheet } from "./schematic";
export type { ValidationReport } from "./validation";

export interface EngineeringRun {
  model: EngineeringModel;
  ruleResults: RuleResult[];
  issues: Issue[];
  bom: Bom;
  schematic: SchematicDoc;
  validation: ValidationReport;
}

/** USER INPUT -> RULES -> MODEL -> BOM + SCHEMATIC + VALIDATION */
export function runFullEngineering(ctx: RunContext): EngineeringRun {
  const { model, ruleResults, issues } = runEngineering(ctx);
  const bom = generateBom(model);
  const schematic = generateSchematic(model, ctx.symbols);
  const validation = buildValidationReport(model, bom, issues);
  return { model, ruleResults, issues, bom, schematic, validation };
}
