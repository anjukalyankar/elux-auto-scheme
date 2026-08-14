
INSERT INTO public.engineering_rules (rule_code, name, description, category, priority, design_options, conditions, actions) VALUES

('R-POWER-010','Breaker selection (VCB)','Selects a vacuum circuit breaker matching the control voltage and at least the required rated current.','POWER',10,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"breakerType","op":"eq","value":"VCB"},{"field":"breakerRatingA","op":"exists"}]}',
'[{"type":"ENABLE_SECTION","section":"POWER"},{"type":"ADD_COMPONENT","tag":"52","function":"Feeder circuit breaker","location":"Breaker compartment","section":"POWER","quantity":1,"select":{"category":"BREAKER","match":{"breaker_type":"$breakerType","coil_voltage":"$controlVoltage"},"gte":{"attr":"rated_current_a","field":"breakerRatingA"},"sortBy":"rated_current_a"}}]'),

('R-POWER-020','Motor symbol on power circuit','Adds the driven motor to the power circuit of a motor feeder.','POWER',15,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"feederType","op":"eq","value":"MOTOR"}]}',
'[{"type":"ADD_MODEL_NODE","nodeType":"MOTOR","tag":"M1","section":"POWER","symbolId":"SYM-MOTOR","label":"Motor"}]'),

('R-CT-010','Phase CT selection','Selects three phase CTs to the entered ratio.','CT',20,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"phaseCtPrimary","op":"exists"},{"field":"phaseCtSecondary","op":"exists"}]}',
'[{"type":"ENABLE_SECTION","section":"CT"},{"type":"ADD_COMPONENT","tag":"CT1","function":"Phase current transformer","location":"CT compartment","section":"CT","quantity":3,"select":{"category":"CT","match":{"ct_type":"PHASE","primary":"$phaseCtPrimary","secondary":"$phaseCtSecondary"}}}]'),

('R-CT-020','CT circuit shorting terminals','CT secondary circuits require shorting/disconnect type terminal blocks.','CT',25,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"phaseCtPrimary","op":"exists"}]}',
'[{"type":"ADD_COMPONENT","tag":"TB-CT","function":"CT shorting terminals","location":"Terminal chamber","section":"TERMINALS","quantity":8,"select":{"category":"TERMINAL_BLOCK","match":{"type":"CT_SHORTING"}}}]'),

('R-EF-010','CBCT for earth fault measurement','Earth-fault protection referenced to a core balance CT requires a CBCT of the entered ratio.','EARTH_FAULT',30,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"protectionFunctions","op":"includes_any","value":["50N","51N","67N"]},{"field":"earthFaultSource","op":"eq","value":"CBCT"},{"field":"cbctPrimary","op":"exists"}]}',
'[{"type":"ENABLE_SECTION","section":"EARTH_FAULT"},{"type":"ADD_COMPONENT","tag":"CBCT1","function":"Core balance CT for earth fault current","location":"Cable box","section":"EARTH_FAULT","quantity":1,"select":{"category":"CBCT","match":{"ct_type":"CBCT","primary":"$cbctPrimary","secondary":"$cbctSecondary"}}}]'),

('R-EF-020','67N directional earth fault polarising source','Directional earth-fault protection needs a residual/polarising voltage source. Confirm the project philosophy.','EARTH_FAULT',31,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"protectionFunctions","op":"includes","value":"67N"}]}',
'[{"type":"ENABLE_SECTION","section":"EF_67N"},{"type":"NOTE","message":"67N selected: directional earth-fault requires a polarising (residual) voltage reference. Confirm the source against the project philosophy."},{"type":"REQUIRE_INPUT","field":"residualVoltageSource","message":"Residual / polarising voltage source is required for 67N. Engineering input required."}]'),

('R-EF-030','Residual voltage from panel VT','When the polarising voltage is derived from a panel VT with open-delta winding, the VT set is part of the feeder scope.','EARTH_FAULT',32,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"protectionFunctions","op":"includes","value":"67N"},{"field":"residualVoltageSource","op":"eq","value":"PANEL_VT_OPEN_DELTA"}]}',
'[{"type":"ADD_COMPONENT","tag":"VT1","function":"Residual (open delta) voltage source for 67N","location":"VT compartment","section":"EF_67N","quantity":1,"select":{"category":"VT","match":{"residual_winding":true}}}]'),

('R-EF-040','Residual voltage from bus VT - interface only','When the polarising voltage comes from the bus VT, only interface wiring and terminals are in feeder scope.','EARTH_FAULT',33,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"protectionFunctions","op":"includes","value":"67N"},{"field":"residualVoltageSource","op":"eq","value":"BUS_VT"}]}',
'[{"type":"NOTE","message":"67N polarising voltage taken from the bus VT. Interpanel wiring and VT selection are outside this feeder scope - verify bus VT residual winding availability."},{"type":"ADD_COMPONENT","tag":"TB-VT","function":"Bus VT residual voltage interface terminals","location":"Terminal chamber","section":"EF_67N","quantity":4,"select":{"category":"TERMINAL_BLOCK","match":{"type":"FEED_THROUGH"}}}]'),

('R-RLY-010','Protection relay selection','Uses the relay selected by the engineer from the relay master.','RELAY',40,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"relayMaterialCode","op":"exists"}]}',
'[{"type":"ENABLE_SECTION","section":"RELAY"},{"type":"ADD_COMPONENT","tag":"K1","function":"Numerical protection relay","location":"Relay/LV compartment","section":"RELAY","quantity":1,"select":{"category":"RELAY","code":"$relayMaterialCode"}}]'),

('R-CTRL-010','Control supply MCB','Every feeder needs a dedicated, protected control supply.','CONTROL',50,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"controlVoltage","op":"exists"}]}',
'[{"type":"ENABLE_SECTION","section":"CONTROL_SUPPLY"},{"type":"ADD_COMPONENT","tag":"Q1","function":"Control supply MCB","location":"LV compartment","section":"CONTROL_SUPPLY","quantity":1,"select":{"category":"MCB","match":{"supply_type":"$controlSupplyType","rating_a":6}}}]'),

('R-CTRL-015','Separate closing supply MCB','A separate MCB is provided for the closing circuit so that a closing fault does not disable protection tripping.','CONTROL',51,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"closeCircuitRequired","op":"eq","value":true}]}',
'[{"type":"ADD_COMPONENT","tag":"Q2","function":"Closing circuit MCB","location":"LV compartment","section":"CLOSE","quantity":1,"select":{"category":"MCB","match":{"supply_type":"$controlSupplyType","rating_a":10}}}]'),

('R-CTRL-020','TNC control switch','Trip-Neutral-Close switch for local breaker operation.','CONTROL',55,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"tncRequired","op":"eq","value":true}]}',
'[{"type":"ADD_COMPONENT","tag":"S1","function":"TNC control switch","location":"Front door","section":"CONTROL_SUPPLY","quantity":1,"select":{"category":"SWITCH","match":{"switch_type":"TNC","control_voltage":"$controlVoltage"}}}]'),

('R-CTRL-030','Local / Remote selector switch','Selects between local panel control and remote/DCS control.','CONTROL',56,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"localRemoteRequired","op":"eq","value":true}]}',
'[{"type":"ADD_COMPONENT","tag":"S2","function":"Local / Remote selector switch","location":"Front door","section":"CONTROL_SUPPLY","quantity":1,"select":{"category":"SWITCH","match":{"switch_type":"LOCAL_REMOTE","control_voltage":"$controlVoltage"}}}]'),

('R-TRIP-010','Trip circuit','Breaker trip circuit driven by the relay trip output.','TRIP',60,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"tripCircuitRequired","op":"eq","value":true}]}',
'[{"type":"ENABLE_SECTION","section":"TRIP"},{"type":"ADD_CONNECTION_GROUP","group":"TRIP_CIRCUIT"}]'),

('R-TRIP-020','Master trip (86) lockout relay','A hand-reset lockout relay is provided for motor feeders so that a protection trip requires acknowledgement before re-closing.','TRIP',61,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"feederType","op":"eq","value":"MOTOR"},{"field":"tripCircuitRequired","op":"eq","value":true}]}',
'[{"type":"ADD_COMPONENT","tag":"K86","function":"Master trip / lockout relay (86)","location":"LV compartment","section":"TRIP","quantity":1,"select":{"category":"AUX_RELAY","match":{"function":"LOCKOUT_86","coil_voltage":"$controlVoltage"}}}]'),

('R-TRIP-030','Trip circuit supervision','Trip circuit supervision relay monitors trip coil continuity in both breaker positions.','TRIP',62,'{ENHANCED,PREMIUM}',
'{"all":[{"field":"tripCircuitRequired","op":"eq","value":true}]}',
'[{"type":"ADD_COMPONENT","tag":"K95","function":"Trip circuit supervision relay","location":"LV compartment","section":"TRIP","quantity":1,"select":{"category":"AUX_RELAY","match":{"function":"TRIP_CIRCUIT_SUPERVISION","coil_voltage":"$controlVoltage"}}}]'),

('R-CLOSE-010','Close circuit','Breaker closing circuit via TNC / remote close command.','CLOSE',65,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"closeCircuitRequired","op":"eq","value":true}]}',
'[{"type":"ENABLE_SECTION","section":"CLOSE"},{"type":"ADD_CONNECTION_GROUP","group":"CLOSE_CIRCUIT"},{"type":"ADD_COMPONENT","tag":"K2","function":"Remote close / command interposing relay","location":"LV compartment","section":"CLOSE","quantity":1,"select":{"category":"AUX_RELAY","match":{"contacts":"4CO","coil_voltage":"$controlVoltage"}}}]'),

('R-IND-010','CB ON indication','Red lamp indicating the breaker is closed.','INDICATION',70,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"indications","op":"includes","value":"CB_ON"}]}',
'[{"type":"ENABLE_SECTION","section":"INDICATION"},{"type":"ADD_COMPONENT","tag":"HL1","function":"CB ON indication","location":"Front door","section":"INDICATION","quantity":1,"select":{"category":"LAMP","match":{"colour":"RED","control_voltage":"$controlVoltage"}}}]'),

('R-IND-020','CB OFF indication','Green lamp indicating the breaker is open.','INDICATION',71,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"indications","op":"includes","value":"CB_OFF"}]}',
'[{"type":"ADD_COMPONENT","tag":"HL2","function":"CB OFF indication","location":"Front door","section":"INDICATION","quantity":1,"select":{"category":"LAMP","match":{"colour":"GREEN","control_voltage":"$controlVoltage"}}}]'),

('R-IND-030','Trip indication','Amber lamp indicating a protection trip.','INDICATION',72,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"indications","op":"includes","value":"TRIP"}]}',
'[{"type":"ADD_COMPONENT","tag":"HL3","function":"Protection trip indication","location":"Front door","section":"INDICATION","quantity":1,"select":{"category":"LAMP","match":{"colour":"AMBER","control_voltage":"$controlVoltage"}}}]'),

('R-IND-040','Spring charged indication','White lamp indicating the closing spring is charged.','INDICATION',73,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"indications","op":"includes","value":"SPRING_CHARGED"}]}',
'[{"type":"ADD_COMPONENT","tag":"HL4","function":"Spring charged indication","location":"Front door","section":"INDICATION","quantity":1,"select":{"category":"LAMP","match":{"colour":"WHITE","control_voltage":"$controlVoltage"}}}]'),

('R-IND-050','Service / Test position indication','Blue lamp indicating breaker service or test position.','INDICATION',74,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"indications","op":"includes","value":"SERVICE_TEST"}]}',
'[{"type":"ADD_COMPONENT","tag":"HL5","function":"Service / Test position indication","location":"Front door","section":"INDICATION","quantity":1,"select":{"category":"LAMP","match":{"colour":"BLUE","control_voltage":"$controlVoltage"}}}]'),

('R-IND-060','Trip circuit healthy indication','White lamp driven from the trip circuit supervision relay.','INDICATION',75,'{ENHANCED,PREMIUM}',
'{"all":[{"field":"indications","op":"includes","value":"TRIP_CIRCUIT_HEALTHY"}]}',
'[{"type":"ADD_COMPONENT","tag":"HL6","function":"Trip circuit healthy indication","location":"Front door","section":"INDICATION","quantity":1,"select":{"category":"LAMP","match":{"colour":"WHITE","control_voltage":"$controlVoltage"}}}]'),

('R-MET-010','Analog ammeter (Standard)','Standard design uses an analog ammeter with selector switch.','METERING',80,'{STANDARD}',
'{"all":[{"field":"meteringRequired","op":"eq","value":true}]}',
'[{"type":"ENABLE_SECTION","section":"METERING"},{"type":"ADD_COMPONENT","tag":"P1","function":"Feeder ammeter","location":"Front door","section":"METERING","quantity":1,"select":{"category":"METER","match":{"meter_type":"AMMETER","ct_secondary":"$phaseCtSecondary"}}},{"type":"ADD_COMPONENT","tag":"S3","function":"Ammeter selector switch","location":"Front door","section":"METERING","quantity":1,"select":{"category":"SWITCH","match":{"switch_type":"AMMETER_SELECTOR"}}}]'),

('R-MET-020','Digital multifunction meter (Enhanced / Premium)','Enhanced and Premium designs use a communicating digital multifunction meter.','METERING',81,'{ENHANCED,PREMIUM}',
'{"all":[{"field":"meteringRequired","op":"eq","value":true}]}',
'[{"type":"ENABLE_SECTION","section":"METERING"},{"type":"ADD_COMPONENT","tag":"P1","function":"Digital multifunction meter","location":"Front door","section":"METERING","quantity":1,"select":{"category":"METER","match":{"meter_type":"MFM","ct_secondary":"$phaseCtSecondary"}}}]'),

('R-OPT-010','Enhanced monitoring - motor temperature scanner','Enhanced designs add winding/bearing temperature monitoring for motor feeders.','DESIGN_OPTION',85,'{ENHANCED,PREMIUM}',
'{"all":[{"field":"feederType","op":"eq","value":"MOTOR"}]}',
'[{"type":"ADD_COMPONENT","tag":"P2","function":"Motor temperature scanner (RTD)","location":"Front door","section":"METERING","quantity":1,"select":{"category":"METER","match":{"meter_type":"TEMPERATURE_SCANNER"}}}]'),

('R-OPT-020','Premium - station bus communication','Premium designs include a managed ethernet switch for station bus communication.','DESIGN_OPTION',86,'{PREMIUM}',
'{"all":[]}',
'[{"type":"ADD_COMPONENT","tag":"NW1","function":"Station bus ethernet switch","location":"LV compartment","section":"CONTROL_SUPPLY","quantity":1,"select":{"category":"MISC","match":{"feature":"COMMUNICATION"}}}]'),

('R-OPT-030','Premium - conformal coating','Premium designs include conformal coating of electronic modules.','DESIGN_OPTION',87,'{PREMIUM}',
'{"all":[{"field":"conformalCoating","op":"eq","value":true}]}',
'[{"type":"ADD_COMPONENT","tag":"CC1","function":"Conformal coating of electronic modules","location":"Panel","section":"CONTROL_SUPPLY","quantity":1,"select":{"category":"MISC","match":{"feature":"CONFORMAL_COATING"}}}]'),

('R-TB-010','Feeder terminal blocks','Feed-through terminals for control, indication and interface wiring.','TERMINALS',90,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[]}',
'[{"type":"ENABLE_SECTION","section":"TERMINALS"},{"type":"ADD_COMPONENT","tag":"TB1","function":"Control and interface terminals","location":"Terminal chamber","section":"TERMINALS","quantity":40,"select":{"category":"TERMINAL_BLOCK","match":{"type":"FEED_THROUGH"}}}]'),

('R-VAL-010','CBCT / relay earth input compatibility','Flags a mismatch between the CBCT secondary and the relay earth current input.','VALIDATION',95,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"cbctSecondary","op":"exists"},{"field":"relayEarthInputCurrent","op":"exists"},{"field":"cbctSecondary","op":"neq_field","value":"relayEarthInputCurrent"}]}',
'[{"type":"WARN","code":"CT_MISMATCH","message":"Compatibility warning: CBCT secondary does not match the selected relay earth-current input. Engineering review required - an interposing CT or a different CBCT/relay variant may be needed."}]'),

('R-VAL-020','Phase CT / relay input compatibility','Flags a mismatch between the phase CT secondary and the relay phase current input.','VALIDATION',96,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"phaseCtSecondary","op":"exists"},{"field":"relayInputCurrent","op":"exists"},{"field":"phaseCtSecondary","op":"neq_field","value":"relayInputCurrent"}]}',
'[{"type":"ERROR","code":"CT_RELAY_MISMATCH","message":"Compatibility error: phase CT secondary does not match the selected relay phase-current input rating."}]'),

('R-VAL-030','Relay auxiliary supply compatibility','Flags a mismatch between the panel control voltage and the relay auxiliary supply.','VALIDATION',97,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"relayAuxSupply","op":"exists"},{"field":"controlVoltage","op":"neq_field","value":"relayAuxSupply"}]}',
'[{"type":"ERROR","code":"VOLTAGE_MISMATCH","message":"Voltage mismatch: panel control voltage differs from the selected relay auxiliary supply."}]'),

('R-VAL-040','Relay protection function coverage','Flags protection functions requested but not supported by the selected relay.','VALIDATION',98,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"unsupportedProtectionFunctions","op":"not_empty"}]}',
'[{"type":"ERROR","code":"PROTECTION_NOT_SUPPORTED","message":"The selected relay does not provide all requested protection functions. Engineering review required."}]'),

('R-VAL-050','Breaker voltage class check','The breaker voltage class must be at least the system voltage.','VALIDATION',99,'{STANDARD,ENHANCED,PREMIUM}',
'{"all":[{"field":"voltageKv","op":"gt","value":7.2}]}',
'[{"type":"WARN","code":"BREAKER_CLASS","message":"System voltage exceeds the 7.2 kV switchgear class available in the material master. Engineering review required."}]');
