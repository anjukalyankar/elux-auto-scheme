import type { EngineeringModel, ModelComponent, ModelConnection } from "./types";

export const POS_RAIL = "BUS:L+";
export const NEG_RAIL = "BUS:L-";

function byTag(model: EngineeringModel, tag: string): ModelComponent | undefined {
  return model.components.find((c) => c.tag === tag);
}

function hasTerminal(c: ModelComponent | undefined, id: string): boolean {
  return !!c?.terminals.some((t) => t.id === id);
}

/**
 * Builds the electrical connections of the feeder from the engineering model.
 * Connections are only created when both endpoints exist in the model, so the
 * schematic never invents wiring that the rules did not produce.
 */
export function buildConnections(model: EngineeringModel): ModelConnection[] {
  const out: ModelConnection[] = [];
  let n = 0;
  const add = (
    fromId: string,
    fromT: string,
    toId: string,
    toT: string,
    section: string,
    wire: string,
  ) => {
    n += 1;
    out.push({
      id: `W${String(n).padStart(3, "0")}`,
      from: { componentId: fromId, terminal: fromT },
      to: { componentId: toId, terminal: toT },
      section,
      wire,
    });
  };

  const breaker = byTag(model, "52");
  const relay = byTag(model, "K1");
  const ct = byTag(model, "CT1");
  const cbct = byTag(model, "CBCT1");
  const ctTb = byTag(model, "TB-CT");
  const mcb = byTag(model, "Q1");
  const closeMcb = byTag(model, "Q2");
  const tnc = byTag(model, "S1");
  const lockout = byTag(model, "K86");
  const tcs = byTag(model, "K95");
  const closeRelay = byTag(model, "K2");
  const meter = byTag(model, "P1");

  /* ---- control supply ---- */
  if (mcb) {
    add(POS_RAIL, "L+", mcb.componentId, "1", "CONTROL_SUPPLY", "Control supply incoming +");
    add(mcb.componentId, "2", NEG_RAIL, "L-", "CONTROL_SUPPLY", "Protected control supply bus");
  }
  if (relay && mcb) {
    add(mcb.componentId, "2", relay.componentId, "F1", "CONTROL_SUPPLY", "Relay auxiliary supply +");
    add(relay.componentId, "F2", NEG_RAIL, "L-", "CONTROL_SUPPLY", "Relay auxiliary supply -");
  }

  /* ---- CT circuit ---- */
  if (ct && ctTb) {
    add(ct.componentId, "S1", ctTb.componentId, "A", "CT", "Phase CT secondary S1");
    add(ctTb.componentId, "B", ct.componentId, "S2", "CT", "Phase CT secondary return S2");
  }
  if (ctTb && relay) {
    add(ctTb.componentId, "A", relay.componentId, "Q1", "CT", "Phase current IL1 to relay");
    add(relay.componentId, "Q2", ctTb.componentId, "B", "CT", "Phase current IL1 return");
  } else if (ct && relay) {
    add(ct.componentId, "S1", relay.componentId, "Q1", "CT", "Phase current IL1 to relay");
    add(relay.componentId, "Q2", ct.componentId, "S2", "CT", "Phase current IL1 return");
  }
  if (meter && ct && hasTerminal(meter, "I1")) {
    add(ct.componentId, "S1", meter.componentId, "I1", "METERING", "Metering current in");
    add(meter.componentId, "I2", ct.componentId, "S2", "METERING", "Metering current return");
  }

  /* ---- earth fault / 67N ---- */
  if (cbct && relay) {
    add(cbct.componentId, "S1", relay.componentId, "Q7", "EARTH_FAULT", "CBCT earth current to relay IE");
    add(relay.componentId, "Q8", cbct.componentId, "S2", "EARTH_FAULT", "CBCT earth current return");
  }

  /* ---- trip circuit ---- */
  if (relay && lockout) {
    add(relay.componentId, "BO1", lockout.componentId, "A1", "TRIP", "Relay trip output to 86 lockout");
    add(lockout.componentId, "A2", NEG_RAIL, "L-", "TRIP", "86 coil negative");
  }
  if (breaker) {
    const tripSource = lockout ?? relay;
    if (tripSource) {
      const term = lockout ? "14" : "BO1";
      add(tripSource.componentId, term, breaker.componentId, "TC1", "TRIP", "Trip command to breaker trip coil");
    }
    add(breaker.componentId, "TC2", NEG_RAIL, "L-", "TRIP", "Trip coil negative");
    if (mcb) add(mcb.componentId, "2", lockout ? lockout.componentId : breaker.componentId, lockout ? "11" : "TC1", "TRIP", "Trip circuit supply +");
  }
  if (tcs && breaker) {
    add(tcs.componentId, "A1", breaker.componentId, "TC1", "TRIP", "Trip circuit supervision sense");
    add(tcs.componentId, "A2", NEG_RAIL, "L-", "TRIP", "Trip circuit supervision negative");
  }

  /* ---- close circuit ---- */
  if (tnc && breaker) {
    const supply = closeMcb ?? mcb;
    if (supply) add(supply.componentId, "2", tnc.componentId, "C", "CLOSE", "Close/trip switch supply");
    add(tnc.componentId, "CL", breaker.componentId, "CC1", "CLOSE", "Local close command");
    add(breaker.componentId, "CC2", NEG_RAIL, "L-", "CLOSE", "Close coil negative");
    if (lockout) add(tnc.componentId, "T", lockout.componentId, "A1", "TRIP", "Local trip command");
    else add(tnc.componentId, "T", breaker.componentId, "TC1", "TRIP", "Local trip command");
  }
  if (closeRelay && breaker) {
    add(closeRelay.componentId, "14", breaker.componentId, "CC1", "CLOSE", "Remote close command contact");
    add(closeRelay.componentId, "A2", NEG_RAIL, "L-", "CLOSE", "Remote close relay negative");
  }

  /* ---- indications ---- */
  const indicationSource: Record<
    string,
    { comp: ModelComponent | undefined; terminal: string; label: string }
  > = {
    HL1: { comp: breaker, terminal: "NO1", label: "CB ON from 52a" },
    HL2: { comp: breaker, terminal: "NC1", label: "CB OFF from 52b" },
    HL3: { comp: lockout ?? relay, terminal: lockout ? "14" : "BO3", label: "Trip indication" },
    HL4: { comp: breaker, terminal: "SC1", label: "Spring charged" },
    HL5: { comp: breaker, terminal: "TS1", label: "Service / Test position" },
    HL6: { comp: tcs, terminal: "14", label: "Trip circuit healthy" },
  };
  for (const [tag, src] of Object.entries(indicationSource)) {
    const lamp = byTag(model, tag);
    if (!lamp) continue;
    if (src.comp) add(src.comp.componentId, src.terminal, lamp.componentId, "X1", "INDICATION", src.label);
    add(lamp.componentId, "X2", NEG_RAIL, "L-", "INDICATION", `${src.label} return`);
  }

  return out;
}
