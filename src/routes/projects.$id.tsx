import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SchematicView } from "@/components/engineering/SchematicView";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { bomToCsv, type Bom, type EngineeringModel, type SchematicDoc, type ValidationReport } from "@/lib/engineering";
import { money } from "@/lib/masters";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({
    meta: [
      { title: "Engineering Result — ELEXORA" },
      { name: "description", content: "Engineering model, bill of materials, schematic sheets and validation report for a feeder design." },
      { property: "og:title", content: "Engineering Result — ELEXORA" },
      { property: "og:description", content: "Engineering model, bill of materials, schematic sheets and validation report for a feeder design." },
    ],
  }),
  component: ProjectDetail,
});

const TABS = ["Model", "BOM", "Schematic", "Validation"] as const;

function ProjectDetail() {
  const { id } = useParams({ from: "/projects/$id" });
  const [tab, setTab] = useState<(typeof TABS)[number]>("BOM");

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const model = data?.engineering_model as unknown as EngineeringModel | null;
  const bom = data?.bom as unknown as Bom | null;
  const schematic = data?.schematic as unknown as SchematicDoc | null;
  const validation = data?.validation as unknown as ValidationReport | null;

  function downloadCsv() {
    if (!bom) return;
    const header = ["Material Code", "Description", "Manufacturer", "Model", "Unit", "Quantity", "Unit Price", "Total Price", "Category", "Tags"];
    const blob = new Blob([bomToCsv(bom, header)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data?.name ?? "ELEXORA_BOM"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const unresolved = bom?.unpricedLines ?? 0;
  const validationErrors = validation?.bom.filter((x) => x.severity === "ERROR").length ?? 0;

  return (
    <AppShell
      title={data?.name ?? "Project"}
      subtitle={data ? `${data.panel_number ?? "—"} · ${data.revision} · ${data.status}` : "Loading…"}
      actions={
        <Button variant="outline" onClick={downloadCsv} disabled={!bom || bom.lines.length === 0}>
          Export BOM CSV
        </Button>
      }
    >
      {isLoading ? <p className="label-tech">Loading engineering data…</p> : null}
      {error ? <p className="text-sm text-destructive">Unable to load this project.</p> : null}

      {!isLoading && !error && data ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-sm border bg-card p-4">
              <p className="label-tech">BOM components</p>
              <p className="mt-1 font-mono text-2xl font-semibold">{bom?.totalComponents ?? 0}</p>
            </div>
            <div className="rounded-sm border bg-card p-4">
              <p className="label-tech">Total quantity</p>
              <p className="mt-1 font-mono text-2xl font-semibold">{bom?.totalQuantity ?? 0}</p>
            </div>
            <div className="rounded-sm border bg-card p-4">
              <p className="label-tech">BOM cost</p>
              <p className="mt-1 font-mono text-2xl font-semibold">{money(bom?.totalCost ?? 0)}</p>
            </div>
          </div>

          {unresolved > 0 || validationErrors > 0 ? (
            <div className="rounded-sm border border-amber-500/50 bg-amber-500/5 px-4 py-3 text-sm">
              <p className="font-semibold">Engineering review required</p>
              {unresolved > 0 ? <p className="text-muted-foreground">{unresolved} BOM line(s) are unpriced/unresolved.</p> : null}
              {validationErrors > 0 ? <p className="text-muted-foreground">{validationErrors} validation error(s) are present.</p> : null}
            </div>
          ) : null}

          <div className="flex gap-1 border-b">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider ${
                  tab === t ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "BOM" ? (
            bom ? (
              <div className="overflow-x-auto rounded-sm border bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 font-mono text-xs uppercase">
                    <tr>
                      {['Material Code','Description','Manufacturer','Model','Unit','Qty','Unit Price','Total Price'].map((k) => (
                        <th key={k} className="px-3 py-2 text-left font-normal">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bom.lines.map((line, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs">{line.materialCode}</td>
                        <td className="px-3 py-2">{line.description}</td>
                        <td className="px-3 py-2">{line.manufacturer}</td>
                        <td className="px-3 py-2">{line.model}</td>
                        <td className="px-3 py-2">{line.unit}</td>
                        <td className="px-3 py-2 text-right">{line.quantity}</td>
                        <td className="px-3 py-2 text-right">{money(line.unitPrice)}</td>
                        <td className="px-3 py-2 text-right">{money(line.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t bg-muted/40 font-mono text-sm">
                    <tr>
                      <td colSpan={5} className="px-3 py-2 font-semibold">TOTAL</td>
                      <td className="px-3 py-2 text-right font-semibold">{bom.totalQuantity}</td>
                      <td />
                      <td className="px-3 py-2 text-right font-semibold">{money(bom.totalCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : <p className="text-sm text-muted-foreground">No BOM has been generated.</p>
          ) : null}

          {tab === "Schematic" ? (schematic ? <SchematicView doc={schematic} /> : <p className="text-sm text-muted-foreground">No schematic has been generated.</p>) : null}

          {tab === "Validation" ? (
            <div className="space-y-2">
              {[...(validation?.bom ?? []), ...(validation?.schematic ?? [])].map((issue, i) => (
                <div key={i} className="rounded-sm border bg-card px-3 py-2 text-sm">
                  <span className="font-mono text-xs uppercase text-muted-foreground">{issue.severity}</span>{" "}
                  {issue.message}
                </div>
              ))}
              {(validation?.bom.length ?? 0) + (validation?.schematic.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No validation issues. Design is approvable.</p>
              ) : null}
            </div>
          ) : null}

          {tab === "Model" ? (
            <pre className="overflow-auto rounded-sm border bg-card p-4 font-mono text-xs">{JSON.stringify(model, null, 2)}</pre>
          ) : null}
        </div>
      ) : null}
    </AppShell>
  );
}
