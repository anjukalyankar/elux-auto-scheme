-- ELEXORA Material Master V1
-- Source: user-approved ELEXORA_simple_material_master_input(1).xlsx
-- Important: Unit Price is intentionally NULL where the supplied sheet is blank.
-- No material code, make, model or price has been invented here.

INSERT INTO public.materials
(material_code, category, component_type, description, manufacturer, model, unit, unit_price, rated_voltage, rated_current, attributes, active)
VALUES
('CT1','CT','CT','Current Transformer','Pragati / ECS','CT2C-5A','NOS',NULL,'33kV',NULL,'{"source_spec":"33kV; Core 1: 30-15/5A, 5VA, class 0.5, ISF≤5; Core 2: 30-15/5A, 5VA, class 5P15"}',true),
('AMM-SCH-DM3110','Meter','METER','Digital Ammeter','Schneider','DM3110','NOS',NULL,NULL,NULL,'{"source_spec":"Accuracy class 0.5; 96x96 mm; 0-15A-30A range; 5A CT input"}',true),
('MFM-SCH-EM6400NG','Meter','METER','Digital Multifunction Meter','Schneider Electric / Conzerv','EM6400NG','NOS',NULL,NULL,NULL,'{"source_spec":"Accuracy class 0.5S; 96x96 mm; 3-phase 4-wire; Modbus RS485; 5A CT; PT 33kV/√3/110V/√3"}',true),
('7SJ6615-5EB92-1FA0+L0D','Relay','RELAY','Protection Relay','Siemens','7SJ6615-5EB92-1FA0+L0D','NOS',NULL,'110VDC','5A','{"source_spec":"16BI+7BO; 110VDC auxiliary; 5A CT input; 50/51, 50N/51N, 74TC; Modbus RS485"}',true),
('A7E00060042851','Communication','COMMUNICATION','RJ45 to RS485 Converter','Connectwell','A7E00060042851','NOS',NULL,NULL,NULL,'{"source_spec":"For Siemens 7SJ66 relay; RS485"}',true),
('CAT-6-4','Cable','CABLE','CAT-6 Cable','Polycab','CAT-6','METER',NULL,NULL,NULL,'{"source_spec":"Communication cable; reference specifies 4 m"}',true),
('RJ45-1','Connector','CONNECTOR','RJ45 Connector Module Plug',NULL,'RJ45 connector module plug','NOS',NULL,NULL,NULL,'{"source_spec":"Reference specifies 2 Nos"}',true),
('PQ8NCH2J','Auxiliary Relay','AUX_RELAY','Master Trip Relay','ABB','PQ8NCH2J','NOS',NULL,'110VDC',NULL,'{"source_spec":"86; 5NO+2NC HR; 110VDC"}',true),
('CV2D2J','Auxiliary Relay','AUX_RELAY','Transformer Fault Relay','ABB','CV2D2J','NOS',NULL,'110VDC',NULL,'{"source_spec":"63TX; 2 elements; 2NO H/R per pole; 110VDC"}',true),
('3SB5285-6HE04','Lamp','LAMP','LED Lamp - Green','Siemens','3SB52 85-6HE04','NOS',NULL,'110VDC',NULL,'{"source_spec":"110VDC; complete unit"}',true),
('3SB5285-6HC04','Lamp','LAMP','LED Lamp - Red','Siemens','3SB52 85-6HC04','NOS',NULL,'110VDC',NULL,'{"source_spec":"110VDC; complete unit"}',true),
('3SB5285-6HL04','Lamp','LAMP','LED Lamp - Amber','Siemens','3SB52 85-6HL04','NOS',NULL,'110VDC',NULL,'{"source_spec":"110VDC; complete unit"}',true),
('3SB5285-6HG04','Lamp','LAMP','LED Lamp - White','Siemens','3SB52 85-6HG04','NOS',NULL,'110VDC',NULL,'{"source_spec":"110VDC; complete unit"}',true),
('3SB5285-6HF04','Lamp','LAMP','LED Lamp - Blue','Siemens','3SB52 85-6HF04','NOS',NULL,'110VDC',NULL,'{"source_spec":"110VDC; complete unit"}',true),
('3SB5000-0UC01','Push Button','PUSH_BUTTON','Emergency Trip Push Button','Siemens','3SB50 00-0UC01','NOS',NULL,'110VDC',NULL,'{"source_spec":"40mm; red; protective shrouds"}',true),
('3SB5400-0A','Contact Block','CONTACT_BLOCK','Push Contact Block','Siemens','3SB54 00-0A','NOS',NULL,NULL,NULL,'{"source_spec":"Rear connection; 1NO+1NC"}',true),
('SPC 25P 449 B/L','Selector Switch','SWITCH','Local/Remote Switch','Switron','SPC 25P 449 B/L','NOS',NULL,NULL,NULL,'{"source_spec":"4 pole; 2-way; no OFF; 90°; lockable"}',true),
('SBC 25P 484R','Control Switch','TNC_SWITCH','TNC Switch','Switron','SBC 25P 484R','NOS',NULL,NULL,NULL,'{"source_spec":"8 ways; 120°; pistol grip; 4NO close + 4NO trip"}',true),
('MBAS 0600-2-0B14SP0','Annunciator','ANNUNCIATOR','Annunciator','Minilec','MBAS 0600-2-0B14SP0','NOS',NULL,'110VDC',NULL,'{"source_spec":"14 windows; 110VDC; 144x144 mm; MBAS 0600-2-0B14SP0"}',true),
('ALAN-HOOTER','Hooter','HOOTER','Hooter','Alan',NULL,'NOS',NULL,'110VDC',NULL,'{"source_spec":"110VDC; 96x96 mm; exact model/code not stated"}',true),
('5SL4106-7RC','MCB','MCB','MCB 1P 6A','Siemens','5SL4106-7RC','NOS',NULL,'240VAC','6A','{"source_spec":"10kA; 6A; 1P; 240VAC"}',true),
('5SL5216-7RC','MCB','MCB','MCB 2P 16A','Siemens','5SL5216-7RC','NOS',NULL,'110VDC','16A','{"source_spec":"10kA; 16A; 2P; 110VDC"}',true),
('5SL4216-7RC','MCB','MCB','MCB 2P 16A','Siemens','5SL4216-7RC','NOS',NULL,'240VAC','16A','{"source_spec":"10kA; 16A; 2P; 240VAC"}',true),
('5SL4210-7RC','MCB','MCB','MCB 2P 10A','Siemens','5SL4210-7RC','NOS',NULL,'240VAC','10A','{"source_spec":"10kA; 10A; 2P; 240VAC"}',true),
('5SL5206-7RC','MCB','MCB','MCB 2P 6A','Siemens','5SL5206-7RC','NOS',NULL,'110VDC','6A','{"source_spec":"10kA; 6A; 2P; 110VDC"}',true),
('5SL4402-7RC','MCB','MCB','MCB 4P 2A','Siemens','5SL4402-7RC','NOS',NULL,'110VAC','2A','{"source_spec":"10kA; 2A; 4P; 110VAC"}',true),
('5ST3010','Auxiliary Contact','AUX_CONTACT','MCB Auxiliary Contact','Siemens','5ST3010','NOS',NULL,NULL,NULL,'{"source_spec":"1NO+1NC"}',true),
('LED-5W','Panel Accessory','PANEL_ILLUMINATION','LED Tube Fixture','SYSKA / PHILIPS / reputed make',NULL,'NOS',NULL,'240VAC',NULL,'{"source_spec":"5W; 240VAC; surface mounting; exact make/model not fixed"}',true),
('LS-ELEMEX-1NONC','Limit Switch','LIMIT_SWITCH','Limit Switch','Elmex',NULL,'NOS',NULL,NULL,NULL,'{"source_spec":"Push rod; snap action; 1NO+1NC; exact model/code not stated"}',true),
('PS-ANCHOR','Socket','SOCKET','Plug Socket','Anchor','6/16A 2PIN+E','NOS',NULL,'240VAC',NULL,'{"source_spec":"6/16A; 2P+E; built-in switch; 240VAC"}',true)
ON CONFLICT (material_code) DO UPDATE SET
  category=EXCLUDED.category,
  component_type=EXCLUDED.component_type,
  description=EXCLUDED.description,
  manufacturer=EXCLUDED.manufacturer,
  model=EXCLUDED.model,
  unit=EXCLUDED.unit,
  unit_price=COALESCE(EXCLUDED.unit_price, public.materials.unit_price),
  rated_voltage=EXCLUDED.rated_voltage,
  rated_current=EXCLUDED.rated_current,
  attributes=EXCLUDED.attributes,
  active=EXCLUDED.active;

-- Verified relay data from the reference drawing/master data. No 67N capability is added here because the supplied reference relay lists 50, 51, 50N, 51N, 74TC only.
INSERT INTO public.relay_details
(material_id, rated_input_current, earth_input_current, aux_supply, protection_functions, binary_inputs, binary_outputs, communication)
SELECT id, '5A', NULL, '110VDC', ARRAY['50','51','50N','51N','74TC'], 16, 7, 'Modbus RS485'
FROM public.materials
WHERE material_code='7SJ6615-5EB92-1FA0+L0D'
ON CONFLICT (material_id) DO UPDATE SET
  rated_input_current=EXCLUDED.rated_input_current,
  earth_input_current=EXCLUDED.earth_input_current,
  aux_supply=EXCLUDED.aux_supply,
  protection_functions=EXCLUDED.protection_functions,
  binary_inputs=EXCLUDED.binary_inputs,
  binary_outputs=EXCLUDED.binary_outputs,
  communication=EXCLUDED.communication;

-- Verified CT data from the reference drawing. The 30-15/5A selectable ratio is retained as text in attributes; no single primary current is guessed.
INSERT INTO public.ct_details
(material_id, ct_type, primary_current, secondary_current, accuracy_class, burden_va, protection_class, cores)
SELECT id, 'WOUND TYPE - TWO CORE', 30, 5, '0.5 / 5P15', 5, '5P15', 2
FROM public.materials
WHERE material_code='CT1'
ON CONFLICT (material_id) DO UPDATE SET
  ct_type=EXCLUDED.ct_type,
  primary_current=EXCLUDED.primary_current,
  secondary_current=EXCLUDED.secondary_current,
  accuracy_class=EXCLUDED.accuracy_class,
  burden_va=EXCLUDED.burden_va,
  protection_class=EXCLUDED.protection_class,
  cores=EXCLUDED.cores;
