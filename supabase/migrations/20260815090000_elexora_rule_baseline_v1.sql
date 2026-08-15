-- ELEXORA Engineering Rule Baseline V1
-- Scope: mandatory panel accessories + protection/CT compatibility checks.
-- Material selection is intentionally category/attribute based; approved MSL codes must exist in public.materials.

INSERT INTO public.engineering_rules
(rule_code, name, description, category, priority, design_options, conditions, actions)
VALUES
(
  'R-PANEL-010',
  'Panel space heater - mandatory',
  'Space heater is mandatory for every panel design.',
  'PANEL_ACCESSORY',
  5,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[]}',
  '[{"type":"ENABLE_SECTION","section":"CONTROL_SUPPLY"},{"type":"ADD_COMPONENT","tag":"EH1","function":"Panel space heater","location":"Panel interior","section":"CONTROL_SUPPLY","quantity":1,"select":{"category":"SPACE_HEATER","match":{"control_voltage":"$controlVoltage"}}}]'
),
(
  'R-PANEL-011',
  'Space heater thermostat - mandatory',
  'A thermostat is mandatory with the panel space heater.',
  'PANEL_ACCESSORY',
  6,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[]}',
  '[{"type":"ADD_COMPONENT","tag":"TH1","function":"Space heater thermostat","location":"Panel interior","section":"CONTROL_SUPPLY","quantity":1,"select":{"category":"THERMOSTAT"}}]'
),
(
  'R-PANEL-012',
  'Panel illumination - mandatory',
  'Panel illumination is mandatory for every panel design.',
  'PANEL_ACCESSORY',
  7,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[]}',
  '[{"type":"ADD_COMPONENT","tag":"EL1","function":"Panel illumination","location":"Panel interior","section":"CONTROL_SUPPLY","quantity":1,"select":{"category":"PANEL_ILLUMINATION"}}]'
),
(
  'R-VAL-010',
  '67N relay protection-function compatibility',
  '67N may only be selected when the selected relay master supports 67N.',
  'VALIDATION',
  12,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"protectionFunctions","op":"includes","value":"67N"},{"field":"unsupportedProtectionFunctions","op":"includes","value":"67N"}]}',
  '[{"type":"ERROR","code":"RELAY_67N_UNSUPPORTED","message":"67N is selected but the selected relay master does not support 67N. Select a relay with approved 67N capability."}]'
),
(
  'R-VAL-011',
  '67N CBCT secondary to relay earth input compatibility',
  'For CBCT-based 67N, the CBCT secondary current must match the selected relay earth input current unless an approved interface scheme is explicitly defined.',
  'VALIDATION',
  13,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"protectionFunctions","op":"includes","value":"67N"},{"field":"earthFaultSource","op":"eq","value":"CBCT"},{"field":"cbctSecondary","op":"exists"},{"field":"relayEarthInputCurrent","op":"exists"},{"field":"cbctSecondary","op":"neq_field","value":"relayEarthInputCurrent"}]}',
  '[{"type":"ERROR","code":"CBCT_RELAY_SECONDARY_MISMATCH","message":"67N CBCT secondary does not match the selected relay earth-input current. Do not release the design until an approved matching/interface scheme is defined."}]'
),
(
  'R-VAL-012',
  '67N residual voltage source required',
  'Directional earth fault requires an approved polarising/residual voltage source.',
  'VALIDATION',
  14,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"protectionFunctions","op":"includes","value":"67N"},{"field":"residualVoltageSource","op":"not_empty"}]}',
  '[{"type":"NOTE","message":"67N residual/polarising voltage source has been specified. Verify the selected source against the project protection philosophy."}]'
),
(
  'R-VAL-013',
  '67N residual voltage source missing',
  '67N cannot be released without an identified polarising/residual voltage source.',
  'VALIDATION',
  15,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"protectionFunctions","op":"includes","value":"67N"}],"any":[]}',
  '[{"type":"REQUIRE_INPUT","field":"residualVoltageSource","message":"67N requires an approved residual/polarising voltage source. Select the source before generating the design."}]'
)
ON CONFLICT (rule_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  design_options = EXCLUDED.design_options,
  conditions = EXCLUDED.conditions,
  actions = EXCLUDED.actions,
  active = true;
