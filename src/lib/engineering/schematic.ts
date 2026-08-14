import { NEG_RAIL, POS_RAIL } from "./connections";
import type { EngineeringModel, SymbolDef } from "./types";

export interface PlacedPin {
  id: string;
  label: string;
  x: number;
  y: number;
  side: "L" | "R";
}

export interface PlacedSymbol {
  componentId: string;
  tag: string;
  title: string;
  subtitle: string;
  symbolId: string | null;
  symbolType: string;
  x: number;
  y: number;
  w: number;
  h: number;
  pins: PlacedPin[];
}

export interface SchematicWire {
  id: string;
  label: string;
  points: [number, number][];
}

export interface SchematicSheet {
  section: string;
  title: string;
  width: number;
  height: number;
  railTopY: number;
  railBottomY: number;
  symbols: PlacedSymbol[];
  wires: SchematicWire[];
  notes: string[];
}

export interface SchematicDoc {
  template: string;
  generatedAt: string;
  sheets: SchematicSheet[];
}

const SECTION_TITLES: Record<string, string> = {
  POWER: "Power circuit",
  CT: "CT circuit",
  EARTH_FAULT: "Earth fault / CBCT circuit",
  EF_67N: "67N directional earth fault circuit",
  RELAY: "Protection relay circuit",
  CONTROL_SUPPLY: "Control supply",
  TRIP: "Trip circuit",
  CLOSE: "Close circuit",
  INDICATION: "Indication circuit",
  METERING: "Metering circuit",
  TERMINALS: "Terminal section",
};

const SECTION_ORDER = [
  "POWER",
  "CT",
  "EARTH_FAULT",
  "EF_67N",
  "RELAY",
  "CONTROL_SUPPLY",
  "TRIP",
  "CLOSE",
  "INDICATION",
  "METERING",
  "TERMINALS",
];

const BOX_W = 130;
const BOX_H = 96;
const GAP_X = 60;
const MARGIN_X = 70;
const ROW_Y = 150;
const ROW_GAP = 170;
const PER_ROW = 6;

function symbolType(symbolId: string | null, symbols: SymbolDef[]): string {
  const s = symbols.find((x) => x.symbol_id === symbolId);
  return s?.component_type ?? "GENERIC";
}

/**
 * Generates the schematic layout directly from the engineering model.
 * Nothing is drawn that is not present in the model.
 */
export function generateSchematic(model: EngineeringModel, symbols: SymbolDef[]): SchematicDoc {
  const sections = SECTION_ORDER.filter(
    (s) => model.components.some((c) => c.section === s) || model.connections.some((w) => w.section === s),
  );

  const sheets: SchematicSheet[] = sections.map((section) => {
    const comps = model.components.filter((c) => c.section === section);
    const wires = model.connections.filter((w) => w.section === section);

    // Components referenced by this section's wiring but placed on other sheets
    const referenced = new Set<string>();
    wires.forEach((w) => {
      referenced.add(w.from.componentId);
      referenced.add(w.to.componentId);
    });
    const external = model.components.filter(
      (c) => c.section !== section && referenced.has(c.componentId),
    );

    const placedList = [...comps, ...external];
    const rows = Math.max(1, Math.ceil(placedList.length / PER_ROW));
    const height = ROW_Y + rows * ROW_GAP + 80;
    const width = Math.max(900, MARGIN_X * 2 + Math.min(PER_ROW, Math.max(1, placedList.length)) * (BOX_W + GAP_X));
    const railTopY = 70;
    const railBottomY = height - 50;

    const placed: PlacedSymbol[] = placedList.map((c, i) => {
      const col = i % PER_ROW;
      const row = Math.floor(i / PER_ROW);
      const x = MARGIN_X + col * (BOX_W + GAP_X);
      const y = ROW_Y + row * ROW_GAP;
      const terms = c.terminals.length > 0 ? c.terminals : [{ id: "1", label: "1", group: "GENERIC" }];
      const half = Math.ceil(terms.length / 2);
      const pins: PlacedPin[] = terms.map((t, idx) => {
        const side: "L" | "R" = idx < half ? "L" : "R";
        const inSide = side === "L" ? idx : idx - half;
        const count = side === "L" ? half : terms.length - half;
        const step = BOX_H / (count + 1);
        return {
          id: t.id,
          label: t.label,
          x: side === "L" ? x : x + BOX_W,
          y: y + step * (inSide + 1),
          side,
        };
      });
      return {
        componentId: c.componentId,
        tag: c.tag,
        title: c.tag,
        subtitle: c.materialCode ?? "UNRESOLVED",
        symbolId: c.symbolId,
        symbolType: symbolType(c.symbolId, symbols),
        x,
        y,
        w: BOX_W,
        h: BOX_H,
        pins,
      };
    });

    const byId = new Map(placed.map((p) => [p.componentId, p]));

    const drawn: SchematicWire[] = [];
    wires.forEach((w, i) => {
      const a = endpoint(w.from.componentId, w.from.terminal);
      const b = endpoint(w.to.componentId, w.to.terminal);
      if (!a || !b) return;
      const midX = (a[0] + b[0]) / 2;
      const points: [number, number][] =
        Math.abs(a[1] - b[1]) < 2
          ? [a, b]
          : [a, [midX, a[1]], [midX, b[1]], b];
      drawn.push({ id: w.id, label: w.wire, points });
    });

    function endpoint(componentId: string, terminal: string): [number, number] | null {
      if (componentId === POS_RAIL) return null;
      if (componentId === NEG_RAIL) return null;
      const p = byId.get(componentId);
      if (!p) return null;
      const pin = p.pins.find((x) => x.id === terminal) ?? p.pins[0];
      return pin ? [pin.x, pin.y] : null;
    }

    // wires to the supply rails
    wires.forEach((w) => {
      const railSide = w.from.componentId === POS_RAIL || w.to.componentId === POS_RAIL ? "TOP" : w.from.componentId === NEG_RAIL || w.to.componentId === NEG_RAIL ? "BOTTOM" : null;
      if (!railSide) return;
      const other = [w.from, w.to].find((e) => e.componentId !== POS_RAIL && e.componentId !== NEG_RAIL);
      if (!other) return;
      const p = byId.get(other.componentId);
      if (!p) return;
      const pin = p.pins.find((x) => x.id === other.terminal) ?? p.pins[0];
      if (!pin) return;
      const railY = railSide === "TOP" ? railTopY : railBottomY;
      drawn.push({
        id: `${w.id}R`,
        label: w.wire,
        points: [
          [pin.x, pin.y],
          [pin.x + (pin.side === "R" ? 30 : -30), pin.y],
          [pin.x + (pin.side === "R" ? 30 : -30), railY],
        ],
      });
    });

    return {
      section,
      title: SECTION_TITLES[section] ?? section,
      width,
      height,
      railTopY,
      railBottomY,
      symbols: placed,
      wires: drawn,
      notes: external.length > 0 ? [`Cross-referenced components from other sections: ${external.map((c) => c.tag).join(", ")}`] : [],
    };
  });

  return {
    template: model.feeder.feederType === "MOTOR" ? "MOTOR_FEEDER_TEMPLATE_V1" : "GENERIC_FEEDER_TEMPLATE_V1",
    generatedAt: new Date().toISOString(),
    sheets,
  };
}
