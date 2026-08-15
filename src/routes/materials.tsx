import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { mastersQuery, money } from "@/lib/masters";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Material Master — ELEXORA" },
      { name: "description", content: "Central material master for relays, CTs, breakers and control components used by the rule engine." },
      { property: "og:title", content: "Material Master — ELEXORA" },
      { property: "og:description", content: "Central material master for relays, CTs, breakers and control components used by the rule engine." },
    ],
  }),
  component: MaterialsPage,
});

function MaterialsPage() {
  const { data, isLoading } = useQuery(mastersQuery);
  return (
    <AppShell title="Material master" subtitle="Single source of truth for BOM generation">
      <div className="overflow-x-auto rounded-sm border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 font-mono text-xs uppercase">
            <tr>
              {["Code", "Category", "Type", "Description", "Make", "Model", "Rating", "Unit price"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : (
              (data?.materials ?? []).map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{m.material_code}</td>
                  <td className="px-3 py-2">{m.category}</td>
                  <td className="px-3 py-2">{m.component_type}</td>
                  <td className="px-3 py-2">{m.description}</td>
                  <td className="px-3 py-2">{m.manufacturer}</td>
                  <td className="px-3 py-2">{m.model}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {m.rated_voltage} {m.rated_current}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{money(m.unit_price)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
