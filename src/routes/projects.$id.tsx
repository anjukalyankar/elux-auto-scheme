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

  const { data, isLoading } = useQuery({
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
    const blob = new Blob([bomToCsv(bom, Object.keys(bom.lines[0] ?? { item: "" }))], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data?.name ?? "bom"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell
      title={data?.name ?? "Project"}
      subtitle={data ? `${data.panel_number ?? "—"} · ${data.revision} · ${data.status}` : "Loading…"}
      actions={
        <Button variant="outline" onClick={downloadCsv} disabled={!bom}>
          Export BOM CSV
        </Button>
      }
    >
      {isLoading ? (
        <p className="label-tech">Loading engineering data…</p>
      ) : (
        <div className="space-y-4">
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

          {tab === "BOM" && bom ? (
            <div className="overflow-x-auto rounded-sm border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 font-mono text-xs uppercase">
                  <tr>
                    {Object.keys(bom.lines[0] ?? { item: "" }).map((k) => (
                      <th key={k} className="px-3 py-2 text-left font-normal">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bom.lines.map((line, i) => (
                    <tr key={i} className="border-t">
                      {Object.values(line as unknown as Record<string, unknown>).map((v, j) => (
                        <td key={j} className="px-3 py-2">
                          {typeof v === "object" ? JSON.stringify(v) : String(v ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t px-3 py-2 text-right font-mono text-sm">
                Total: {money((bom as unknown as { total?: number }).total ?? 0)}
              </div>
            </div>
          ) : null}

          {tab === "Schematic" && schematic ? <SchematicView doc={schematic} /> : null}

          {tab === "Validation" && validation ? (
            <div className="space-y-2">
              {[...validation.bom, ...validation.schematic].map((issue, i) => (
                <div key={i} className="rounded-sm border bg-card px-3 py-2 text-sm">
                  <span className="font-mono text-xs uppercase text-muted-foreground">{issue.severity}</span>{" "}
                  {issue.message}
                </div>
              ))}
              {validation.bom.length + validation.schematic.length === 0 ? (
                <p className="text-sm text-muted-foreground">No validation issues. Design is approvable.</p>
              ) : null}
            </div>
          ) : null}

          {tab === "Model" ? (
            <pre className="overflow-auto rounded-sm border bg-card p-4 font-mono text-xs">
              {JSON.stringify(model, null, 2)}
            </pre>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
