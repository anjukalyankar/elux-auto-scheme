
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- SYMBOLS
CREATE TABLE public.symbols (
  symbol_id TEXT PRIMARY KEY,
  component_type TEXT NOT NULL,
  symbol_name TEXT NOT NULL,
  pins JSONB NOT NULL DEFAULT '[]'::jsonb,
  width INT NOT NULL DEFAULT 60,
  height INT NOT NULL DEFAULT 60,
  orientation TEXT NOT NULL DEFAULT 'VERTICAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.symbols TO authenticated;
GRANT ALL ON public.symbols TO service_role;
ALTER TABLE public.symbols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "symbols_read" ON public.symbols FOR SELECT TO authenticated USING (true);
CREATE POLICY "symbols_write" ON public.symbols FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TERMINAL TEMPLATES
CREATE TABLE public.terminal_templates (
  template_id TEXT PRIMARY KEY,
  component_type TEXT NOT NULL,
  name TEXT NOT NULL,
  terminals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.terminal_templates TO authenticated;
GRANT ALL ON public.terminal_templates TO service_role;
ALTER TABLE public.terminal_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tt_read" ON public.terminal_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "tt_write" ON public.terminal_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MATERIALS
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  component_type TEXT NOT NULL,
  description TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  unit TEXT NOT NULL DEFAULT 'NOS',
  unit_price NUMERIC(14,2),
  symbol_id TEXT REFERENCES public.symbols(symbol_id),
  terminal_template_id TEXT REFERENCES public.terminal_templates(template_id),
  rated_voltage TEXT,
  rated_current TEXT,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materials TO authenticated;
GRANT ALL ON public.materials TO service_role;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materials_read" ON public.materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "materials_write" ON public.materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER materials_touch BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RELAY DETAILS
CREATE TABLE public.relay_details (
  material_id UUID PRIMARY KEY REFERENCES public.materials(id) ON DELETE CASCADE,
  rated_input_current TEXT NOT NULL,
  earth_input_current TEXT,
  aux_supply TEXT NOT NULL,
  protection_functions TEXT[] NOT NULL DEFAULT '{}',
  binary_inputs INT NOT NULL DEFAULT 0,
  binary_outputs INT NOT NULL DEFAULT 0,
  communication TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relay_details TO authenticated;
GRANT ALL ON public.relay_details TO service_role;
ALTER TABLE public.relay_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "relay_read" ON public.relay_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "relay_write" ON public.relay_details FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CT DETAILS
CREATE TABLE public.ct_details (
  material_id UUID PRIMARY KEY REFERENCES public.materials(id) ON DELETE CASCADE,
  ct_type TEXT NOT NULL,
  primary_current NUMERIC NOT NULL,
  secondary_current NUMERIC NOT NULL,
  accuracy_class TEXT,
  burden_va NUMERIC,
  protection_class TEXT,
  cores INT NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ct_details TO authenticated;
GRANT ALL ON public.ct_details TO service_role;
ALTER TABLE public.ct_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ct_read" ON public.ct_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "ct_write" ON public.ct_details FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- BREAKER DETAILS
CREATE TABLE public.breaker_details (
  material_id UUID PRIMARY KEY REFERENCES public.materials(id) ON DELETE CASCADE,
  breaker_type TEXT NOT NULL,
  rated_voltage_kv NUMERIC NOT NULL,
  rated_current_a NUMERIC NOT NULL,
  breaking_capacity_ka NUMERIC,
  closing_coil_voltage TEXT,
  trip_coil_voltage TEXT,
  aux_contacts TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.breaker_details TO authenticated;
GRANT ALL ON public.breaker_details TO service_role;
ALTER TABLE public.breaker_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brk_read" ON public.breaker_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "brk_write" ON public.breaker_details FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ENGINEERING RULES
CREATE TABLE public.engineering_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  priority INT NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true,
  design_options TEXT[] NOT NULL DEFAULT '{STANDARD,ENHANCED,PREMIUM}',
  conditions JSONB NOT NULL DEFAULT '{"all":[]}'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.engineering_rules TO authenticated;
GRANT ALL ON public.engineering_rules TO service_role;
ALTER TABLE public.engineering_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_read" ON public.engineering_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "rules_write" ON public.engineering_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER rules_touch BEFORE UPDATE ON public.engineering_rules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PROJECTS
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module TEXT NOT NULL DEFAULT 'NEW_DESIGN',
  name TEXT NOT NULL,
  customer TEXT,
  project_number TEXT,
  panel_number TEXT,
  revision TEXT NOT NULL DEFAULT 'REV 0',
  engineer TEXT,
  project_date DATE,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  engineering_model JSONB,
  rule_results JSONB,
  bom JSONB,
  schematic JSONB,
  validation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_own" ON public.projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ SEED: SYMBOLS ============
INSERT INTO public.symbols (symbol_id, component_type, symbol_name, pins, width, height) VALUES
('SYM-VCB','BREAKER','Vacuum Circuit Breaker','[{"id":"1","label":"IN","x":30,"y":0},{"id":"2","label":"OUT","x":30,"y":80}]',60,80),
('SYM-CT','CT','Current Transformer','[{"id":"P1","label":"P1","x":30,"y":0},{"id":"P2","label":"P2","x":30,"y":70},{"id":"S1","label":"S1","x":60,"y":25},{"id":"S2","label":"S2","x":60,"y":45}]',60,70),
('SYM-CBCT','CBCT','Core Balance CT','[{"id":"S1","label":"S1","x":70,"y":20},{"id":"S2","label":"S2","x":70,"y":40}]',70,60),
('SYM-RELAY','RELAY','Numerical Protection Relay','[{"id":"A1","label":"A1","x":0,"y":20},{"id":"A2","label":"A2","x":0,"y":40},{"id":"IL1","label":"IL1","x":0,"y":60},{"id":"IE","label":"IE","x":0,"y":80},{"id":"BO1","label":"BO1","x":120,"y":30},{"id":"BI1","label":"BI1","x":120,"y":60}]',120,110),
('SYM-LAMP','LAMP','Indication Lamp','[{"id":"X1","label":"X1","x":20,"y":0},{"id":"X2","label":"X2","x":20,"y":40}]',40,40),
('SYM-FUSE','FUSE','Fuse','[{"id":"1","label":"1","x":15,"y":0},{"id":"2","label":"2","x":15,"y":40}]',30,40),
('SYM-MCB','MCB','Miniature Circuit Breaker','[{"id":"1","label":"1","x":15,"y":0},{"id":"2","label":"2","x":15,"y":40}]',30,40),
('SYM-SWITCH','SWITCH','Selector Switch','[{"id":"C","label":"C","x":20,"y":0},{"id":"L","label":"L","x":0,"y":40},{"id":"R","label":"R","x":40,"y":40}]',40,40),
('SYM-TNC','SWITCH','Trip-Neutral-Close Switch','[{"id":"C","label":"COM","x":25,"y":0},{"id":"T","label":"TRIP","x":0,"y":50},{"id":"N","label":"N","x":25,"y":50},{"id":"CL","label":"CLOSE","x":50,"y":50}]',50,50),
('SYM-TB','TERMINAL','Terminal Block','[{"id":"A","label":"A","x":10,"y":0},{"id":"B","label":"B","x":10,"y":20}]',20,20),
('SYM-AUXR','AUX_RELAY','Auxiliary Relay','[{"id":"A1","label":"A1","x":25,"y":0},{"id":"A2","label":"A2","x":25,"y":50}]',50,50),
('SYM-MOTOR','MOTOR','Motor','[{"id":"U","label":"U","x":30,"y":0}]',60,60),
('SYM-BUS','BUSBAR','Busbar','[]',200,6),
('SYM-VT','VT','Voltage Transformer','[{"id":"P1","label":"P1","x":30,"y":0},{"id":"S1","label":"S1","x":60,"y":30}]',60,70),
('SYM-METER','METER','Meter','[{"id":"I1","label":"I1","x":0,"y":20},{"id":"I2","label":"I2","x":0,"y":40}]',60,50);

-- ============ SEED: TERMINAL TEMPLATES ============
INSERT INTO public.terminal_templates (template_id, component_type, name, terminals) VALUES
('TT-RELAY-7SJ66','RELAY','Siemens 7SJ66 terminal template','[{"id":"F1","label":"A1 Aux +","group":"SUPPLY"},{"id":"F2","label":"A2 Aux -","group":"SUPPLY"},{"id":"Q1","label":"IL1","group":"CURRENT"},{"id":"Q2","label":"IL1 return","group":"CURRENT"},{"id":"Q3","label":"IL2","group":"CURRENT"},{"id":"Q4","label":"IL2 return","group":"CURRENT"},{"id":"Q5","label":"IL3","group":"CURRENT"},{"id":"Q6","label":"IL3 return","group":"CURRENT"},{"id":"Q7","label":"IE (earth)","group":"CURRENT"},{"id":"Q8","label":"IE return","group":"CURRENT"},{"id":"BI1","label":"Binary input 1","group":"BINARY_IN"},{"id":"BI2","label":"Binary input 2","group":"BINARY_IN"},{"id":"BO1","label":"Trip output","group":"BINARY_OUT"},{"id":"BO2","label":"Close output","group":"BINARY_OUT"},{"id":"BO3","label":"Alarm output","group":"BINARY_OUT"}]'),
('TT-VCB','BREAKER','VCB terminal template','[{"id":"TC1","label":"Trip coil +","group":"TRIP"},{"id":"TC2","label":"Trip coil -","group":"TRIP"},{"id":"CC1","label":"Close coil +","group":"CLOSE"},{"id":"CC2","label":"Close coil -","group":"CLOSE"},{"id":"NO1","label":"Aux NO 52a","group":"AUX"},{"id":"NC1","label":"Aux NC 52b","group":"AUX"},{"id":"SC1","label":"Spring charged contact","group":"AUX"},{"id":"TS1","label":"Service/Test contact","group":"AUX"}]'),
('TT-CT','CT','CT terminal template','[{"id":"S1","label":"S1","group":"CURRENT"},{"id":"S2","label":"S2","group":"CURRENT"}]'),
('TT-CBCT','CBCT','CBCT terminal template','[{"id":"S1","label":"S1","group":"CURRENT"},{"id":"S2","label":"S2","group":"CURRENT"}]'),
('TT-LAMP','LAMP','Lamp terminal template','[{"id":"X1","label":"X1","group":"CONTROL"},{"id":"X2","label":"X2","group":"CONTROL"}]'),
('TT-TNC','SWITCH','TNC switch terminal template','[{"id":"C","label":"Common","group":"CONTROL"},{"id":"T","label":"Trip","group":"CONTROL"},{"id":"CL","label":"Close","group":"CONTROL"}]'),
('TT-LR','SWITCH','Local/Remote switch terminal template','[{"id":"C","label":"Common","group":"CONTROL"},{"id":"L","label":"Local","group":"CONTROL"},{"id":"R","label":"Remote","group":"CONTROL"}]'),
('TT-2P','GENERIC','Two pole device','[{"id":"1","label":"1","group":"CONTROL"},{"id":"2","label":"2","group":"CONTROL"}]'),
('TT-AUXR','AUX_RELAY','Auxiliary relay template','[{"id":"A1","label":"A1","group":"CONTROL"},{"id":"A2","label":"A2","group":"CONTROL"},{"id":"11","label":"11 COM","group":"CONTACT"},{"id":"14","label":"14 NO","group":"CONTACT"},{"id":"12","label":"12 NC","group":"CONTACT"}]'),
('TT-METER','METER','Meter template','[{"id":"I1","label":"Current in","group":"CURRENT"},{"id":"I2","label":"Current out","group":"CURRENT"}]'),
('TT-TB','TERMINAL','Terminal block','[{"id":"A","label":"A","group":"TERMINAL"},{"id":"B","label":"B","group":"TERMINAL"}]');

-- ============ SEED: MATERIALS ============
INSERT INTO public.materials (material_code, category, component_type, description, manufacturer, model, unit, unit_price, symbol_id, terminal_template_id, rated_voltage, rated_current, attributes) VALUES
('BRK-VCB-7212-630','BREAKER','BREAKER','Vacuum Circuit Breaker 7.2kV 630A 25kA, 110V DC coils','Siemens','3AH5-7.2/630','NOS',485000,'SYM-VCB','TT-VCB','7.2kV','630A','{"breaker_type":"VCB","voltage_class_kv":7.2,"rated_current_a":630,"coil_voltage":"110VDC"}'),
('BRK-VCB-7212-1250','BREAKER','BREAKER','Vacuum Circuit Breaker 7.2kV 1250A 25kA, 110V DC coils','Siemens','3AH5-7.2/1250','NOS',565000,'SYM-VCB','TT-VCB','7.2kV','1250A','{"breaker_type":"VCB","voltage_class_kv":7.2,"rated_current_a":1250,"coil_voltage":"110VDC"}'),
('CT-100-1-PS','CT','CT','Phase CT 100/1A, Core-1 5P20 15VA / Core-2 PS class','ABB','TPU-100/1','NOS',26500,'SYM-CT','TT-CT','7.2kV','100/1A','{"ct_type":"PHASE","primary":100,"secondary":1,"class":"5P20","va":15}'),
('CT-200-1-PS','CT','CT','Phase CT 200/1A, Core-1 5P20 15VA / Core-2 PS class','ABB','TPU-200/1','NOS',28500,'SYM-CT','TT-CT','7.2kV','200/1A','{"ct_type":"PHASE","primary":200,"secondary":1,"class":"5P20","va":15}'),
('CT-100-5-PS','CT','CT','Phase CT 100/5A, Core-1 5P20 15VA','ABB','TPU-100/5','NOS',26500,'SYM-CT','TT-CT','7.2kV','100/5A','{"ct_type":"PHASE","primary":100,"secondary":5,"class":"5P20","va":15}'),
('CBCT-50-1','CBCT','CBCT','Core Balance CT 50/1A, 120mm window','Kappa','CBCT-120/50/1','NOS',9800,'SYM-CBCT','TT-CBCT','1.1kV','50/1A','{"ct_type":"CBCT","primary":50,"secondary":1,"window_mm":120}'),
('CBCT-50-5','CBCT','CBCT','Core Balance CT 50/5A, 120mm window','Kappa','CBCT-120/50/5','NOS',9800,'SYM-CBCT','TT-CBCT','1.1kV','50/5A','{"ct_type":"CBCT","primary":50,"secondary":5,"window_mm":120}'),
('RLY-7SJ6622-1A','RELAY','RELAY','Numerical feeder/motor protection relay 7SJ6622, 1A inputs, 110V DC aux','Siemens','7SJ6622','NOS',185000,'SYM-RELAY','TT-RELAY-7SJ66','110VDC','1A','{"relay_family":"7SJ66","input_current":"1A","aux_supply":"110VDC","tier":"STANDARD"}'),
('RLY-7SJ6622-5A','RELAY','RELAY','Numerical feeder/motor protection relay 7SJ6622, 5A inputs, 110V DC aux','Siemens','7SJ6622','NOS',185000,'SYM-RELAY','TT-RELAY-7SJ66','110VDC','5A','{"relay_family":"7SJ66","input_current":"5A","aux_supply":"110VDC","tier":"STANDARD"}'),
('RLY-7SJ8532-1A','RELAY','RELAY','Numerical protection relay 7SJ85, 1A inputs, 110V DC aux, IEC61850, extended I/O','Siemens','7SJ85','NOS',295000,'SYM-RELAY','TT-RELAY-7SJ66','110VDC','1A','{"relay_family":"7SJ85","input_current":"1A","aux_supply":"110VDC","tier":"PREMIUM"}'),
('LMP-RED-110DC','LAMP','LAMP','LED indication lamp 22.5mm RED, 110V DC','Teknic','TK-LED-R-110DC','NOS',420,'SYM-LAMP','TT-LAMP','110VDC',NULL,'{"colour":"RED","control_voltage":"110VDC"}'),
('LMP-GRN-110DC','LAMP','LAMP','LED indication lamp 22.5mm GREEN, 110V DC','Teknic','TK-LED-G-110DC','NOS',420,'SYM-LAMP','TT-LAMP','110VDC',NULL,'{"colour":"GREEN","control_voltage":"110VDC"}'),
('LMP-AMB-110DC','LAMP','LAMP','LED indication lamp 22.5mm AMBER, 110V DC','Teknic','TK-LED-A-110DC','NOS',420,'SYM-LAMP','TT-LAMP','110VDC',NULL,'{"colour":"AMBER","control_voltage":"110VDC"}'),
('LMP-WHT-110DC','LAMP','LAMP','LED indication lamp 22.5mm WHITE, 110V DC','Teknic','TK-LED-W-110DC','NOS',420,'SYM-LAMP','TT-LAMP','110VDC',NULL,'{"colour":"WHITE","control_voltage":"110VDC"}'),
('LMP-BLU-110DC','LAMP','LAMP','LED indication lamp 22.5mm BLUE, 110V DC','Teknic','TK-LED-B-110DC','NOS',420,'SYM-LAMP','TT-LAMP','110VDC',NULL,'{"colour":"BLUE","control_voltage":"110VDC"}'),
('LMP-RED-220DC','LAMP','LAMP','LED indication lamp 22.5mm RED, 220V DC','Teknic','TK-LED-R-220DC','NOS',430,'SYM-LAMP','TT-LAMP','220VDC',NULL,'{"colour":"RED","control_voltage":"220VDC"}'),
('LMP-GRN-220DC','LAMP','LAMP','LED indication lamp 22.5mm GREEN, 220V DC','Teknic','TK-LED-G-220DC','NOS',430,'SYM-LAMP','TT-LAMP','220VDC',NULL,'{"colour":"GREEN","control_voltage":"220VDC"}'),
('SW-TNC-110DC','SWITCH','SWITCH','TNC control switch, spring return to neutral, 3 position, 110V DC duty','Kaycee','TNC-3P-SR','NOS',3850,'SYM-TNC','TT-TNC','110VDC',NULL,'{"switch_type":"TNC","positions":3,"control_voltage":"110VDC"}'),
('SW-LR-110DC','SWITCH','SWITCH','Local/Remote selector switch, 2 position stay put','Kaycee','SEL-2P','NOS',2450,'SYM-SWITCH','TT-LR','110VDC',NULL,'{"switch_type":"LOCAL_REMOTE","positions":2,"control_voltage":"110VDC"}'),
('SW-AMM-SEL','SWITCH','SWITCH','Ammeter selector switch 4 position','Kaycee','ASS-4P','NOS',1850,'SYM-SWITCH','TT-LR','660V',NULL,'{"switch_type":"AMMETER_SELECTOR","positions":4}'),
('MTR-AMM-1A','METER','METER','Analog ammeter 96x96, 0-100A scale, 1A CT input','AE','AE-AM-96','NOS',2200,'SYM-METER','TT-METER','-','1A','{"meter_type":"AMMETER","ct_secondary":1}'),
('MTR-AMM-5A','METER','METER','Analog ammeter 96x96, 0-100A scale, 5A CT input','AE','AE-AM-96-5','NOS',2200,'SYM-METER','TT-METER','-','5A','{"meter_type":"AMMETER","ct_secondary":5}'),
('MTR-MFM-1A','METER','METER','Digital multifunction meter, 1A CT input, RS485 Modbus','Secure','Elite 440','NOS',14500,'SYM-METER','TT-METER','110-415V','1A','{"meter_type":"MFM","ct_secondary":1,"communication":"MODBUS"}'),
('MTR-MFM-5A','METER','METER','Digital multifunction meter, 5A CT input, RS485 Modbus','Secure','Elite 440','NOS',14500,'SYM-METER','TT-METER','110-415V','5A','{"meter_type":"MFM","ct_secondary":5,"communication":"MODBUS"}'),
('MCB-2P-6A-DC','MCB','MCB','MCB 2 Pole 6A C-curve, DC rated 250V DC','Schneider','A9N-2P-6A-DC','NOS',1650,'SYM-MCB','TT-2P','250VDC','6A','{"poles":2,"rating_a":6,"supply_type":"DC"}'),
('MCB-2P-10A-DC','MCB','MCB','MCB 2 Pole 10A C-curve, DC rated 250V DC','Schneider','A9N-2P-10A-DC','NOS',1720,'SYM-MCB','TT-2P','250VDC','10A','{"poles":2,"rating_a":10,"supply_type":"DC"}'),
('FUS-CT-2A','FUSE','FUSE','CT circuit fuse holder with 2A fuse link','Siemens','3NW-2A','NOS',480,'SYM-FUSE','TT-2P','660V','2A','{"rating_a":2,"application":"CT"}'),
('TB-4-SCREW','TERMINAL_BLOCK','TERMINAL','Screw type terminal block 4 sq.mm, grey','Connectwell','CTS4U','NOS',48,'SYM-TB','TT-TB','800V',NULL,'{"size_sqmm":4,"type":"FEED_THROUGH"}'),
('TB-CT-SHORT','TERMINAL_BLOCK','TERMINAL','CT shorting/disconnect terminal block 6 sq.mm','Connectwell','CDL6U','NOS',185,'SYM-TB','TT-TB','800V',NULL,'{"size_sqmm":6,"type":"CT_SHORTING"}'),
('AUXR-110DC-4CO','AUX_RELAY','AUX_RELAY','Auxiliary relay 110V DC, 4 C/O contacts with base','OEN','57 Series 4CO','NOS',1450,'SYM-AUXR','TT-AUXR','110VDC',NULL,'{"contacts":"4CO","coil_voltage":"110VDC"}'),
('AUXR-TCS-110DC','AUX_RELAY','AUX_RELAY','Trip circuit supervision relay 110V DC','Alstom','MVAX-31','NOS',18500,'SYM-AUXR','TT-AUXR','110VDC',NULL,'{"function":"TRIP_CIRCUIT_SUPERVISION","coil_voltage":"110VDC"}'),
('AUXR-LOCKOUT-110DC','AUX_RELAY','AUX_RELAY','Master trip / lockout relay 86, 110V DC, hand reset','Alstom','MVAJ-11','NOS',22500,'SYM-AUXR','TT-AUXR','110VDC',NULL,'{"function":"LOCKOUT_86","coil_voltage":"110VDC"}'),
('VT-6600-110','VT','VT','Voltage transformer 6600/root3 : 110/root3 V, 3 phase set','ABB','VTU-6.6','SET',78000,'SYM-VT','TT-2P','6.6kV',NULL,'{"primary_v":6600,"secondary_v":110,"residual_winding":true}'),
('MISC-COAT','MISC','MISC','Conformal coating of relay/electronic modules','-','-','LOT',7500,NULL,NULL,NULL,NULL,'{"feature":"CONFORMAL_COATING"}'),
('MISC-COMM-SW','MISC','MISC','Managed ethernet switch 8 port for IEC61850 station bus','Moxa','EDS-408A','NOS',48000,NULL,NULL,'110VDC',NULL,'{"feature":"COMMUNICATION"}'),
('MTR-TEMP-SCAN','METER','METER','Motor winding/bearing temperature scanner, 16 channel RTD','Selec','TC-16','NOS',26500,'SYM-METER','TT-METER','110VDC',NULL,'{"meter_type":"TEMPERATURE_SCANNER"}');

INSERT INTO public.relay_details (material_id, rated_input_current, earth_input_current, aux_supply, protection_functions, binary_inputs, binary_outputs, communication)
SELECT id,'1A','1A','110VDC', ARRAY['50','51','50N','51N','67','67N','46','49','27','59','37','48','66','86'],11,6,'IEC 60870-5-103 / Modbus' FROM public.materials WHERE material_code='RLY-7SJ6622-1A';
INSERT INTO public.relay_details (material_id, rated_input_current, earth_input_current, aux_supply, protection_functions, binary_inputs, binary_outputs, communication)
SELECT id,'5A','5A','110VDC', ARRAY['50','51','50N','51N','67','67N','46','49','27','59','37','48','66','86'],11,6,'IEC 60870-5-103 / Modbus' FROM public.materials WHERE material_code='RLY-7SJ6622-5A';
INSERT INTO public.relay_details (material_id, rated_input_current, earth_input_current, aux_supply, protection_functions, binary_inputs, binary_outputs, communication)
SELECT id,'1A','1A','110VDC', ARRAY['50','51','50N','51N','67','67N','46','49','27','59','87','37','48','66','86'],23,16,'IEC 61850 / Modbus TCP' FROM public.materials WHERE material_code='RLY-7SJ8532-1A';

INSERT INTO public.ct_details (material_id, ct_type, primary_current, secondary_current, accuracy_class, burden_va, protection_class, cores)
SELECT id,'PHASE',100,1,'0.5',15,'5P20',2 FROM public.materials WHERE material_code='CT-100-1-PS';
INSERT INTO public.ct_details (material_id, ct_type, primary_current, secondary_current, accuracy_class, burden_va, protection_class, cores)
SELECT id,'PHASE',200,1,'0.5',15,'5P20',2 FROM public.materials WHERE material_code='CT-200-1-PS';
INSERT INTO public.ct_details (material_id, ct_type, primary_current, secondary_current, accuracy_class, burden_va, protection_class, cores)
SELECT id,'PHASE',100,5,'0.5',15,'5P20',2 FROM public.materials WHERE material_code='CT-100-5-PS';
INSERT INTO public.ct_details (material_id, ct_type, primary_current, secondary_current, accuracy_class, burden_va, protection_class, cores)
SELECT id,'CBCT',50,1,'5P10',5,'5P10',1 FROM public.materials WHERE material_code='CBCT-50-1';
INSERT INTO public.ct_details (material_id, ct_type, primary_current, secondary_current, accuracy_class, burden_va, protection_class, cores)
SELECT id,'CBCT',50,5,'5P10',5,'5P10',1 FROM public.materials WHERE material_code='CBCT-50-5';

INSERT INTO public.breaker_details (material_id, breaker_type, rated_voltage_kv, rated_current_a, breaking_capacity_ka, closing_coil_voltage, trip_coil_voltage, aux_contacts)
SELECT id,'VCB',7.2,630,25,'110VDC','110VDC','6NO+6NC' FROM public.materials WHERE material_code='BRK-VCB-7212-630';
INSERT INTO public.breaker_details (material_id, breaker_type, rated_voltage_kv, rated_current_a, breaking_capacity_ka, closing_coil_voltage, trip_coil_voltage, aux_contacts)
SELECT id,'VCB',7.2,1250,25,'110VDC','110VDC','6NO+6NC' FROM public.materials WHERE material_code='BRK-VCB-7212-1250';
