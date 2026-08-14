import type { SchematicDoc, SchematicSheet } from "@/lib/engineering";

function SymbolGlyph({ type, w, h }: { type: string; w: number; h: number }) {
  const cx = w / 2;
  const cy = h / 2;
  const stroke = "var(--color-schematic-ink)";
  switch (type) {
    case "BREAKER":
      return (
        <g stroke={stroke} strokeWidth={1.6} fill="none">
          <line x1={cx} y1={8} x2={cx} y2={cy - 14} />
          <line x1={cx} y1={cy + 14} x2={cx} y2={h - 8} />
          <line x1={cx} y1={cy - 14} x2={cx + 16} y2={cy + 12} />
          <rect x={cx - 12} y={cy - 12} width={24} height={24} strokeDasharray="3 3" />
        </g>
      );
    case "CT":
    case "CBCT":
      return (
        <g stroke={stroke} strokeWidth={1.6} fill="none">
          <line x1={cx - 22} y1={8} x2={cx - 22} y2={h - 8} />
          <circle cx={cx} cy={cy} r={13} />
          <circle cx={cx + 14} cy={cy} r={13} />
        </g>
      );
    case "LAMP":
      return (
        <g stroke={stroke} strokeWidth={1.6} fill="none">
          <circle cx={cx} cy={cy} r={14} />
          <line x1={cx - 10} y1={cy - 10} x2={cx + 10} y2={cy + 10} />
          <line x1={cx + 10} y1={cy - 10} x2={cx - 10} y2={cy + 10} />
        </g>
      );
    case "MCB":
    case "FUSE":
      return (
        <g stroke={stroke} strokeWidth={1.6} fill="none">
          <rect x={cx - 9} y={cy - 18} width={18} height={36} />
          <line x1={cx} y1={cy - 18} x2={cx} y2={cy + 18} />
        </g>
      );
    case "SWITCH":
      return (
        <g stroke={stroke} strokeWidth={1.6} fill="none">
          <circle cx={cx} cy={cy} r={4} />
          <line x1={cx} y1={cy} x2={cx + 18} y2={cy - 14} />
          <line x1={cx - 20} y1={cy} x2={cx - 4} y2={cy} />
        </g>
      );
    case "AUX_RELAY":
      return (
        <g stroke={stroke} strokeWidth={1.6} fill="none">
          <rect x={cx - 18} y={cy - 12} width={36} height={24} />
          <line x1={cx - 18} y1={cy - 12} x2={cx + 18} y2={cy + 12} />
        </g>
      );
    case "METER":
      return (
        <g stroke={stroke} strokeWidth={1.6} fill="none">
          <circle cx={cx} cy={cy} r={15} />
          <line x1={cx} y1={cy} x2={cx + 9} y2={cy - 9} />
        </g>
      );
    case "TERMINAL":
      return (
        <g stroke={stroke} strokeWidth={1.6} fill="none">
          <circle cx={cx - 8} cy={cy} r={5} />
          <circle cx={cx + 8} cy={cy} r={5} />
          <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} />
        </g>
      );
    case "RELAY":
      return (
        <g stroke={stroke} strokeWidth={1.6} fill="none">
          <rect x={cx - 24} y={cy - 18} width={48} height={36} />
          <line x1={cx - 24} y1={cy - 6} x2={cx + 24} y2={cy - 6} />
        </g>
      );
    default:
      return (
        <g stroke={stroke} strokeWidth={1.4} fill="none">
          <rect x={cx - 18} y={cy - 14} width={36} height={28} />
        </g>
      );
  }
}

function Sheet({ sheet, index }: { sheet: SchematicSheet; index: number }) {
  return (
    <div className="overflow-x-auto rounded-sm border bg-[var(--color-schematic-paper)]">
      <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
        <p className="font-mono text-xs uppercase tracking-wider text-foreground">
          Sheet {index + 1} — {sheet.title}
        </p>
        <p className="label-tech">
          {sheet.symbols.length} symbols · {sheet.wires.length} wires
        </p>
      </div>
      <svg
        viewBox={`0 0 ${sheet.width} ${sheet.height}`}
        width={sheet.width}
        height={sheet.height}
        className="max-w-none"
        role="img"
        aria-label={`${sheet.title} schematic sheet`}
      >
        <rect width={sheet.width} height={sheet.height} fill="var(--color-schematic-paper)" />
        {/* supply rails */}
        <line
          x1={20}
          y1={sheet.railTopY}
          x2={sheet.width - 20}
          y2={sheet.railTopY}
          stroke="var(--color-destructive)"
          strokeWidth={2}
        />
        <text x={24} y={sheet.railTopY - 6} fontSize={11} fontFamily="monospace" fill="var(--color-schematic-ink)">
          L+ {"("}control supply positive{")"}
        </text>
        <line
          x1={20}
          y1={sheet.railBottomY}
          x2={sheet.width - 20}
          y2={sheet.railBottomY}
          stroke="var(--color-schematic-ink)"
          strokeWidth={2}
        />
        <text x={24} y={sheet.railBottomY + 16} fontSize={11} fontFamily="monospace" fill="var(--color-schematic-ink)">
          L− {"("}control supply negative{")"}
        </text>

        {sheet.wires.map((w) => (
          <polyline
            key={w.id}
            points={w.points.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="var(--color-schematic-wire)"
            strokeWidth={1.4}
          >
            <title>{`${w.id} — ${w.label}`}</title>
          </polyline>
        ))}

        {sheet.symbols.map((s) => (
          <g key={s.componentId}>
            <rect
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              fill="none"
              stroke="var(--color-schematic-ink)"
              strokeWidth={1}
              strokeDasharray="2 3"
              opacity={0.5}
            />
            <g transform={`translate(${s.x},${s.y})`}>
              <SymbolGlyph type={s.symbolType} w={s.w} h={s.h} />
            </g>
            {s.pins.map((p) => (
              <g key={p.id}>
                <circle cx={p.x} cy={p.y} r={2.2} fill="var(--color-schematic-wire)" />
                <text
                  x={p.side === "L" ? p.x - 5 : p.x + 5}
                  y={p.y - 3}
                  fontSize={8}
                  fontFamily="monospace"
                  textAnchor={p.side === "L" ? "end" : "start"}
                  fill="var(--color-schematic-ink)"
                  opacity={0.75}
                >
                  {p.id}
                </text>
              </g>
            ))}
            <text
              x={s.x + s.w / 2}
              y={s.y - 8}
              fontSize={12}
              fontFamily="monospace"
              fontWeight={600}
              textAnchor="middle"
              fill="var(--color-schematic-ink)"
            >
              {s.title}
            </text>
            <text
              x={s.x + s.w / 2}
              y={s.y + s.h + 14}
              fontSize={9}
              fontFamily="monospace"
              textAnchor="middle"
              fill="var(--color-schematic-ink)"
              opacity={0.7}
            >
              {s.subtitle}
            </text>
          </g>
        ))}
      </svg>
      {sheet.notes.length > 0 ? (
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">{sheet.notes.join(" ")}</p>
      ) : null}
    </div>
  );
}

export function SchematicView({ doc }: { doc: SchematicDoc }) {
  return (
    <div className="space-y-4">
      <p className="label-tech">
        Template: {doc.template} · {doc.sheets.length} sheets
      </p>
      {doc.sheets.map((s, i) => (
        <Sheet key={s.section} sheet={s} index={i} />
      ))}
    </div>
  );
}
