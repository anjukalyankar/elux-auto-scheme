/**
 * ELEXORA engineering core types.
 * This module is completely independent of the UI and of the database layer.
 */

export type DesignOption = "STANDARD" | "ENHANCED" | "PREMIUM";

export type FeederType = "MOTOR" | "TRANSFORMER" | "INCOMING" | "OUTGOING" | "BUS_COUPLER";

export interface FeederInputs {
  // Feeder identity
  feederType: FeederType | "";
  panelType: string;
  flowDirection: string;
  designOption: DesignOption;

  // System
  voltageKv: number | null;
  frequencyHz: number | null;
  ratedCurrentA: number | null;
  motorPowerKw: number | null;
  transformerRatingKva: number | null;

  // Breaker
  breakerType: string;
  breakerRatingA: number | null;

  // Protection
  protectionFunctions: string[];
  earthFaultSource: string;
  residualVoltageSource: string;

  // Instrument transformers — ENGINEERING INPUTS (project data, not material master records)
  phaseCtPrimary: number | null;
  phaseCtSecondary: number | null;
  phaseCtClass: string;
  phaseCtVa: number | null;
  phaseCtQuantity: number | null;
  /** Knee point voltage (V) — required for PS-class / differential cores. */
  phaseCtVk?: number | null;
  /** Secondary winding resistance (ohm) — required for PS-class cores. */
  phaseCtRct?: number | null;
  cbctPrimary: number | null;
  cbctSecondary: number | null;
  cbctClass?: string;
  cbctVa?: number | null;
  vtRatio: string;
  vtClass?: string;
  vtVa?: number | null;
  vtFrequencyHz?: number | null;


  // Relay
  relayMaterialCode: string;
  /** Derived from the relay master once a relay is selected. */
  relayInputCurrent?: number | null;
  relayEarthInputCurrent?: number | null;
  relayAuxSupply?: string;
  relayProtectionFunctions?: string[];
  unsupportedProtectionFunctions?: string[];

  // Control circuit
  controlVoltage: string;
  controlSupplyType: "DC" | "AC" | "";
  closeCircuitRequired: boolean;
  tripCircuitRequired: boolean;
  localRemoteRequired: boolean;
  tncRequired: boolean;
  meteringRequired: boolean;
  conformalCoating: boolean;
  indications: string[];

  // Extension panel specific (optional)
  existingPanelNumber?: string;
  newPanelNumber?: string;
  existingBusbar?: string;
  extensionBusbar?: string;
  feederQuantity?: number | null;
  panelDimensions?: string;
  cableEntry?: string;
  customerRequirements?: string;

  [key: string]: unknown;
}

/* ---------------- Rules ---------------- */

export type ConditionOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "includes"
  | "includes_any"
  | "exists"
  | "not_empty"
  | "neq_field";

export interface RuleCondition {
  field: string;
  op: ConditionOperator;
  value?: unknown;
}

export interface RuleConditionGroup {
  all?: (RuleCondition | RuleConditionGroup)[];
  any?: (RuleCondition | RuleConditionGroup)[];
}

export interface MaterialSelector {
  category?: string;
  code?: string;
  match?: Record<string, unknown>;
  gte?: { attr: string; field: string };
  sortBy?: string;
  /** When true the selection is only valid if EXACTLY one material matches. */
  unique?: boolean;
}

/** Specification kind for engineered (project-specific) instrument transformers. */
export type EngineeredSpecKind = "PHASE_CT" | "CBCT" | "VT";

export interface RuleAction {
  type:
    | "ADD_COMPONENT"
    | "ADD_ENGINEERED_ITEM"
    | "ADD_MODEL_NODE"
    | "ENABLE_SECTION"
    | "ADD_CONNECTION_GROUP"
    | "REQUIRE_INPUT"
    | "NOTE"
    | "WARN"
    | "ERROR";
  tag?: string;
  function?: string;
  location?: string;
  section?: string;
  quantity?: number;
  select?: MaterialSelector;
  spec?: EngineeredSpecKind;
  terminalTemplateId?: string;
  nodeType?: string;
  symbolId?: string;
  label?: string;
  group?: string;
  field?: string;
  code?: string;
  message?: string;
}


export interface EngineeringRule {
  id: string;
  rule_code: string;
  name: string;
  description: string | null;
  category: string;
  priority: number;
  active: boolean;
  design_options: string[];
  conditions: RuleConditionGroup;
  actions: RuleAction[];
}

/* ---------------- Materials ---------------- */

export interface Material {
  id: string;
  material_code: string;
  category: string;
  component_type: string;
  description: string;
  manufacturer: string | null;
  model: string | null;
  unit: string;
  unit_price: number | null;
  symbol_id: string | null;
  terminal_template_id: string | null;
  rated_voltage: string | null;
  rated_current: string | null;
  attributes: Record<string, unknown>;
  active: boolean;
}

export interface TerminalTemplate {
  template_id: string;
  component_type: string;
  name: string;
  terminals: { id: string; label: string; group: string }[];
}

export interface SymbolDef {
  symbol_id: string;
  component_type: string;
  symbol_name: string;
  pins: { id: string; label: string; x: number; y: number }[];
  width: number;
  height: number;
}

/* ---------------- Engineering model ---------------- */

export interface ModelComponent {
  componentId: string;
  tag: string;
  function: string;
  location: string;
  section: string;
  quantity: number;
  materialId: string | null;
  materialCode: string | null;
  description: string;
  manufacturer: string | null;
  model: string | null;
  unit: string;
  unitPrice: number | null;
  symbolId: string | null;
  terminalTemplateId: string | null;
  terminals: { id: string; label: string; group: string }[];
  properties: Record<string, unknown>;
  ruleCode: string;
  unresolved?: string;
  /** True for project-engineered items (CT / CBCT / VT) specified by the engineer, not by a material code. */
  engineered?: boolean;
  /** Engineering specification captured from project inputs. */
  spec?: Record<string, unknown>;
}


export interface ModelConnection {
  id: string;
  from: { componentId: string; terminal: string };
  to: { componentId: string; terminal: string };
  section: string;
  wire: string;
}

export interface EngineeringModel {
  generatedAt: string;
  project: { name: string; panelNumber: string; revision: string };
  feeder: FeederInputs;
  sections: string[];
  connectionGroups: string[];
  components: ModelComponent[];
  connections: ModelConnection[];
  nodes: { nodeType: string; tag: string; section: string; symbolId: string; label: string }[];
  notes: string[];
}

export interface RuleResult {
  ruleCode: string;
  name: string;
  category: string;
  fired: boolean;
  reason: string;
  actions: string[];
}

export type IssueSeverity = "ERROR" | "WARNING" | "INFO";

export interface Issue {
  severity: IssueSeverity;
  code: string;
  message: string;
  source: string;
}

export interface BomLine {
  materialCode: string;
  description: string;
  manufacturer: string | null;
  model: string | null;
  unit: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  category: string;
  tags: string[];
}

export interface Bom {
  lines: BomLine[];
  totalComponents: number;
  totalQuantity: number;
  totalCost: number;
  pricedLines: number;
  unpricedLines: number;
}
