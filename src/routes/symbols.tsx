import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { mastersQuery } from "@/lib/masters";

export const Route = createFileRoute("/symbols")({
  head: () => ({
    meta: [
      { title: "Symbols & Terminals — ELEXORA" },
      { name: "description", content: "Schematic symbol library and terminal templates that define component connection points." },
      { property: "og:title", content: "Symbols & Terminals — ELEXORA" },
      { property: "og:description", content: "Schematic symbol library and terminal templates that define component connection points." },
    ],
  }),
  component: SymbolsPage,
});

function SymbolsPage() {
  const { data } = useQuery(mastersQuery);
  return (
    <AppShell title="Symbols & terminals" subtitle="Graphic and connection-point definitions">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-sm border bg-card">
          <h2 className="border-b bg-muted/50 px-4 py-2 font-mono text-xs uppercase">Symbols</h2>
          <ul className="divide-y text-sm">
            {(data?.symbols ?? []).map((s) => (
              <li key={s.symbol_id} className="px-4 py-2">
                <span className="font-mono text-xs text-muted-foreground">{s.symbol_id}</span> · {s.symbol_name} (
                {s.component_type})
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-sm border bg-card">
          <h2 className="border-b bg-muted/50 px-4 py-2 font-mono text-xs uppercase">Terminal templates</h2>
          <ul className="divide-y text-sm">
            {(data?.terminalTemplates ?? []).map((t) => (
              <li key={t.template_id} className="px-4 py-2">
                <span className="font-mono text-xs text-muted-foreground">{t.template_id}</span> · {t.name}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
