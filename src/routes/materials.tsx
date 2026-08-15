import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { mastersQuery, money } from "@/lib/masters";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Material Master — ELEXORA" },
      { name: "description", content: "Central material master for BOM generation." },
    ],
  }),
  component: MaterialsPage,
});

function MaterialsPage() {
  const { data, isLoading, error } = useQuery(mastersQuery);
  return (
    <AppShell title="Material master" subtitle="Single source of truth for BOM generation">
      {isLoading ? <p className="label-tech">Loading material master…</p> : null}
      {error ? <p className="text-sm text-destructive">Unable to load material master.</p> : null}
      {!isLoading && !error ? (
        <div className="overflow-x-auto rounded-sm border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 font-mono text-xs uppercase">
              <tr>
                {["Material Code", "MLFB / Model", "Technical Specification", "Make / Model", "Unit Price"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.materials ?? []).map((m) => (
                <tr key={m.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{m.material_code}</td>
                  <td className="px-3 py-2 font-mono text-xs">{m.model ?? "—"}</td>
                  <td className="px-3 py-2">{m.description ?? "—"}</td>
                  <td className="px-3 py-2">{m.manufacturer ?? "—"}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{money(m.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AppShell>
  );
}
