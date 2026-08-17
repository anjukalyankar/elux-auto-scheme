
update public.engineering_rules
set conditions = '{"any": [{"op": "not_empty", "field": "protectionFunctions"}, {"op": "eq", "field": "meteringRequired", "value": true}]}'::jsonb,
    actions = '[{"type": "ENABLE_SECTION", "section": "CT"},
                {"type": "ADD_ENGINEERED_ITEM", "tag": "CT1", "spec": "PHASE_CT", "section": "CT",
                 "function": "Phase current transformer (project engineered)", "location": "CT compartment",
                 "quantity": 3, "symbolId": "SYM-CT", "terminalTemplateId": "TT-CT"}]'::jsonb,
    name = 'Phase CT engineering data (project input)',
    updated_at = now()
where rule_code = 'R-CT-010';

update public.engineering_rules
set conditions = '{"any": [{"op": "not_empty", "field": "protectionFunctions"}, {"op": "eq", "field": "meteringRequired", "value": true}]}'::jsonb,
    updated_at = now()
where rule_code = 'R-CT-020';

update public.engineering_rules
set conditions = '{"all": [{"op": "includes_any", "field": "protectionFunctions", "value": ["50N", "51N", "67N"]}, {"op": "eq", "field": "earthFaultSource", "value": "CBCT"}]}'::jsonb,
    actions = '[{"type": "ENABLE_SECTION", "section": "EARTH_FAULT"},
                {"type": "ADD_ENGINEERED_ITEM", "tag": "CBCT1", "spec": "CBCT", "section": "EARTH_FAULT",
                 "function": "Core balance CT for earth fault current (project engineered)", "location": "Cable box",
                 "quantity": 1, "symbolId": "SYM-CBCT", "terminalTemplateId": "TT-CBCT"}]'::jsonb,
    name = 'CBCT engineering data (project input)',
    updated_at = now()
where rule_code = 'R-EF-010';

update public.engineering_rules
set actions = '[{"type": "ADD_ENGINEERED_ITEM", "tag": "VT1", "spec": "VT", "section": "EF_67N",
                 "function": "Residual (open delta) voltage transformer (project engineered)", "location": "VT compartment",
                 "quantity": 1, "symbolId": "SYM-VT", "terminalTemplateId": "TT-2P"}]'::jsonb,
    name = 'Panel VT engineering data (project input)',
    updated_at = now()
where rule_code = 'R-EF-030';

update public.engineering_rules
set actions = '[{"type": "ENABLE_SECTION", "section": "METERING"},
                {"tag": "P1", "type": "ADD_COMPONENT", "section": "METERING", "quantity": 1,
                 "function": "Feeder ammeter", "location": "Front door",
                 "select": {"category": "METER", "unique": true,
                            "match": {"meter_type": "AMMETER", "ct_secondary": "$phaseCtSecondary", "ct_primary": "$phaseCtPrimary"}}},
                {"tag": "S3", "type": "ADD_COMPONENT", "section": "METERING", "quantity": 1,
                 "function": "Ammeter selector switch", "location": "Front door",
                 "select": {"category": "SWITCH", "match": {"switch_type": "AMMETER_SELECTOR"}}}]'::jsonb,
    updated_at = now()
where rule_code = 'R-MET-010';

update public.engineering_rules
set actions = '[{"type": "ENABLE_SECTION", "section": "METERING"},
                {"tag": "P1", "type": "ADD_COMPONENT", "section": "METERING", "quantity": 1,
                 "function": "Digital multifunction meter", "location": "Front door",
                 "select": {"category": "METER", "unique": true,
                            "match": {"meter_type": "MFM", "ct_secondary": "$phaseCtSecondary", "ct_primary": "$phaseCtPrimary"}}}]'::jsonb,
    updated_at = now()
where rule_code = 'R-MET-020';
