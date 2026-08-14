import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  CircuitBoard,
  FileSpreadsheet,
  FolderKanban,
  PanelsTopLeft,
  Ruler,
  Settings,
  SquareStack,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { mastersQuery } from "@/lib/masters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELEXORA — Switchgear Engineering Automation" },
      {
        name: "description",
        content:
          "Rule-driven switchgear and feeder engineering: engineering model, automatic BOM and electrical schematic generation from one source of truth.",
      },
      { property: "og:title", content: "ELEXORA — Switchgear Engineering Automation" },
      {
        property: "og:description",
        content: "Design feeders and extension panels, generate BOM and schematics from configurable engineering rules.",
      },
    ],
  }),
  component: Dashboard,
});

const MODULES = [
  { to: "/new-design", label: "New Design", desc: "Wizard-driven feeder engineering", icon: CircuitBoard },
  { to: "/extension-panel", label: "Extension Panel", desc: "Extend an existing board", icon: SquareStack },
  { to: "/projects", label: "BOM Generator", desc: "Priced BOM from the engineering model", icon: FileSpreadsheet },
  { to: "/projects", label: "Schematic Generator", desc: "Motor feeder schematic sheets", icon: PanelsTopLeft },
  { to: "/rules", label: "Engineering Rules", desc: "Configurable rule engine", icon: Ruler },
  { to: "/materials", label: "Material Master", desc: "Materials, relays, CTs, breakers", icon: Boxes },
  { to: "/projects", label: "Projects", desc: "Saved projects and revisions", icon: FolderKanban },
  { to: "/settings", label: "Settings", desc: "Workspace and engineering defaults", icon: Settings },
] as const;

function Dashboard() {
  const { user } = useAuth();
  const masters = useQuery(mastersQuery);
  const projects = useQuery({
    queryKey: ["projects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,name,panel_number,revision,status,module,updated_at")
        .order("updated_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    { label: "Materials", value: masters.data?.materials.length ?? "—" },
    { label: "Active rules", value: masters.data?.rules.filter((r) => r.active).length ?? "—" },
    { label: "Symbols", value: masters.data?.symbols.length ?? "—" },
    { label: "Projects", value: projects.data?.length ?? "—" },
  ];

  return (
    <AppShell title="Engineering dashboard" subtitle="ELEXORA · switchgear and feeder automation">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-sm border bg-card p-4">
              <p className="label-tech">{s.label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="label-tech mb-2">Modules</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MODULES.map((m) => (
              <Link
                key={m.label}
                to={m.to}
                className="group rounded-sm border bg-card p-4 transition-colors hover:border-primary"
              >
                <m.icon className="size-5 text-primary" />
                <p className="mt-3 text-sm font-semibold">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="label-tech mb-2">Recent projects</h2>
          <div className="overflow-hidden rounded-sm border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">Project</th>
                  <th className="px-3 py-2 font-medium">Panel</th>
                  <th className="px-3 py-2 font-medium">Module</th>
                  <th className="px-3 py-2 font-medium">Rev</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(projects.data ?? []).map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/40">
                    <td className="px-3 py-2">
                      <Link to="/projects/$id" params={{ id: p.id }} className="text-primary hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{p.panel_number ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">{p.module}</td>
                    <td className="px-3 py-2 font-mono text-xs">{p.revision}</td>
                    <td className="px-3 py-2 text-xs">{p.status}</td>
                  </tr>
                ))}
                {projects.data?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No projects yet. Start with{" "}
                      <Link to="/new-design" className="text-primary hover:underline">
                        New Design
                      </Link>
                      .
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
