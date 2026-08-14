import type { Bom, BomLine, EngineeringModel } from "./types";

/** Aggregates the engineering model into a priced bill of material. */
export function generateBom(model: EngineeringModel): Bom {
  const map = new Map<string, BomLine>();

  for (const c of model.components) {
    const key = c.materialCode ?? `UNRESOLVED:${c.tag}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += c.quantity;
      existing.totalPrice = existing.unitPrice === null ? null : existing.unitPrice * existing.quantity;
      existing.tags.push(c.tag);
    } else {
      map.set(key, {
        materialCode: c.materialCode ?? "NOT RESOLVED",
        description: c.description,
        manufacturer: c.manufacturer,
        model: c.model,
        unit: c.unit,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        totalPrice: c.unitPrice === null ? null : c.unitPrice * c.quantity,
        category: (c.properties["category"] as string) ?? categoryOf(c.section),
        tags: [c.tag],
      });
    }
  }

  const lines = [...map.values()].sort((a, b) => a.materialCode.localeCompare(b.materialCode));
  return {
    lines,
    totalComponents: lines.length,
    totalQuantity: lines.reduce((s, l) => s + l.quantity, 0),
    totalCost: lines.reduce((s, l) => s + (l.totalPrice ?? 0), 0),
    pricedLines: lines.filter((l) => l.totalPrice !== null).length,
    unpricedLines: lines.filter((l) => l.totalPrice === null).length,
  };
}

function categoryOf(section: string): string {
  return section.replace(/_/g, " ");
}

export function bomToCsv(bom: Bom, header: string[]): string {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [
    header.join(","),
    [
      "Material Code",
      "Description",
      "Manufacturer",
      "Model",
      "Unit",
      "Quantity",
      "Unit Price",
      "Total Price",
      "Category",
      "Tags",
    ].join(","),
    ...bom.lines.map((l) =>
      [
        esc(l.materialCode),
        esc(l.description),
        esc(l.manufacturer),
        esc(l.model),
        esc(l.unit),
        l.quantity,
        l.unitPrice ?? "",
        l.totalPrice ?? "",
        esc(l.category),
        esc(l.tags.join(" / ")),
      ].join(","),
    ),
    "",
    ["", "", "", "", "TOTAL", bom.totalQuantity, "", bom.totalCost, "", ""].join(","),
  ];
  return rows.join("\n");
}
