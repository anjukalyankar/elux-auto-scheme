-- ELEXORA Transformer Feeder Rules V1
-- Scope: first Phase-1 golden test for automatic input -> BOM/schematic.
-- Rules only use material codes already present in the approved Material Master V1.
-- No VAA33/unknown auxiliary material is invented; such a requirement remains unresolved until its MSL entry exists.

INSERT INTO public.engineering_rules
(rule_code, name, description, category, priority, design_options, conditions, actions)
VALUES
(
  'R-TRF-001',
  'Transformer feeder selected relay',
  'Add the relay selected by the engineer for a transformer feeder.',
  'PROTECTION',
  20,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"},{"field":"relayMaterialCode","op":"not_empty"}]}',
  '[{"type":"ADD_COMPONENT","tag":"FPR","function":"Transformer feeder protection relay","location":"Relay compartment","section":"RELAY","quantity":1,"select":{"code":"$relayMaterialCode"}}]'
),
(
  'R-TRF-002',
  'Transformer feeder CB ON indication',
  'Add one red CB ON indication when CB ON is selected.',
  'INDICATION',
  30,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"},{"field":"indications","op":"includes","value":"CB_ON"}]}',
  '[{"type":"ADD_COMPONENT","tag":"HL1","function":"CB ON indication","location":"Front door","section":"INDICATION","quantity":1,"select":{"code":"3SB5285-6HC04"}}]'
),
(
  'R-TRF-003',
  'Transformer feeder CB OFF indication',
  'Add one red CB OFF indication when CB OFF is selected.',
  'INDICATION',
  31,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"},{"field":"indications","op":"includes","value":"CB_OFF"}]}',
  '[{"type":"ADD_COMPONENT","tag":"HL2","function":"CB OFF indication","location":"Front door","section":"INDICATION","quantity":1,"select":{"code":"3SB5285-6HC04"}}]'
),
(
  'R-TRF-004',
  'Transformer feeder trip indication',
  'Add one amber trip indication when trip is selected.',
  'INDICATION',
  32,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"},{"field":"indications","op":"includes","value":"TRIP"}]}',
  '[{"type":"ADD_COMPONENT","tag":"HL3","function":"Trip indication","location":"Front door","section":"INDICATION","quantity":1,"select":{"code":"3SB5285-6HL04"}}]'
),
(
  'R-TRF-005',
  'Transformer feeder digital ammeter',
  'Add one digital ammeter when metering is required and the selected metering type is AMMETER.',
  'METERING',
  40,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"},{"field":"meteringRequired","op":"eq","value":true},{"field":"meteringType","op":"eq","value":"AMMETER"}]}',
  '[{"type":"ADD_COMPONENT","tag":"M1","function":"Digital ammeter","location":"Metering compartment","section":"METERING","quantity":1,"select":{"code":"AMM-SCH-DM3110"}}]'
),
(
  'R-TRF-006',
  'Transformer feeder multifunction meter',
  'Add one multifunction meter when metering is required and the selected metering type is MFM.',
  'METERING',
  41,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"},{"field":"meteringRequired","op":"eq","value":true},{"field":"meteringType","op":"eq","value":"MFM"}]}',
  '[{"type":"ADD_COMPONENT","tag":"M1","function":"Digital multifunction meter","location":"Metering compartment","section":"METERING","quantity":1,"select":{"code":"MFM-SCH-EM6400NG"}}]'
),
(
  'R-TRF-007',
  'Transformer feeder local remote switch',
  'Add one local/remote switch when required.',
  'CONTROL',
  50,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"},{"field":"localRemoteRequired","op":"eq","value":true}]}',
  '[{"type":"ADD_COMPONENT","tag":"S1","function":"Local / Remote switch","location":"Front door","section":"CONTROL_SUPPLY","quantity":1,"select":{"code":"SPC 25P 449 B/L"}}]'
),
(
  'R-TRF-008',
  'Transformer feeder TNC switch',
  'Add one TNC switch when required.',
  'CONTROL',
  51,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"},{"field":"tncRequired","op":"eq","value":true}]}',
  '[{"type":"ADD_COMPONENT","tag":"S2","function":"TNC switch","location":"Front door","section":"CONTROL_SUPPLY","quantity":1,"select":{"code":"SBC 25P 484R"}}]'
),
(
  'R-TRF-009',
  'Transformer feeder master trip relay',
  'Add the master trip relay for the transformer feeder reference philosophy.',
  'CONTROL',
  60,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"}]}',
  '[{"type":"ADD_COMPONENT","tag":"K86","function":"Master trip relay","location":"Relay compartment","section":"TRIP","quantity":1,"select":{"code":"PQ8NCH2J"}}]'
),
(
  'R-TRF-010',
  'Transformer fault relay',
  'Add transformer fault relay for transformer feeder design.',
  'PROTECTION',
  61,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"}]}',
  '[{"type":"ADD_COMPONENT","tag":"K63","function":"Transformer fault relay","location":"Relay compartment","section":"TRIP","quantity":1,"select":{"code":"CV2D2J"}}]'
),
(
  'R-TRF-011',
  'Transformer feeder phase CT input',
  'Require phase CT inputs for transformer feeder design rather than inventing a CT ratio.',
  'CT',
  70,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"}]}',
  '[{"type":"REQUIRE_INPUT","field":"phaseCtPrimary","message":"Enter the selected transformer-feeder phase CT primary ratio."},{"type":"REQUIRE_INPUT","field":"phaseCtSecondary","message":"Enter the selected transformer-feeder phase CT secondary (1A or 5A)."},{"type":"REQUIRE_INPUT","field":"phaseCtClass","message":"Enter the selected phase CT class."}]'
),
(
  'R-TRF-012',
  'Transformer feeder breaker trip circuit',
  'Add trip-circuit section when transformer feeder trip circuit is required.',
  'CONTROL',
  80,
  '{STANDARD,ENHANCED,PREMIUM}',
  '{"all":[{"field":"feederType","op":"eq","value":"TRANSFORMER"},{"field":"tripCircuitRequired","op":"eq","value":true}]}',
  '[{"type":"ENABLE_SECTION","section":"TRIP"}]'
)
ON CONFLICT (rule_code) DO UPDATE SET
  name=EXCLUDED.name,
  description=EXCLUDED.description,
  category=EXCLUDED.category,
  priority=EXCLUDED.priority,
  design_options=EXCLUDED.design_options,
  conditions=EXCLUDED.conditions,
  actions=EXCLUDED.actions,
  active=true;
