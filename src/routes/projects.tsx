import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — ELEXORA" },
      { name: "description", content: "All engineered switchgear projects with generated BOMs, schematics and validation status." },
      { property: "og:title", content: "Projects — ELEXORA" },
      { property: "og:description", content: "All engineered switchgear projects with generated BOMs, schematics and validation status." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,name,customer,panel_number,revision,module,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell title="Projects" subtitle="Saved engineering runs">
      <div className="overflow-x-auto rounded-sm border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 font-mono text-xs uppercase tracking-wider">
            <tr>
              {["Project", "Customer", "Panel", "Rev", "Module", "Status", "Created"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={7}>
                  Loading…
                </td>
              </tr>
            ) : (data ?? []).length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={7}>
                  No projects yet.
                </td>
              </tr>
            ) : (
              (data ?? []).map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/40">
                  <td className="px-3 py-2">
                    <Link to="/projects/$id" params={{ id: p.id }} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{p.customer}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.panel_number}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.revision}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.module}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.status}</td>
                  <td className="px-3 py-2 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
