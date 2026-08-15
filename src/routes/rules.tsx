import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { mastersQuery } from "@/lib/masters";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Engineering Rules — ELEXORA" },
      { name: "description", content: "Configurable engineering rules that drive component selection, wiring and validation." },
      { property: "og:title", content: "Engineering Rules — ELEXORA" },
      { property: "og:description", content: "Configurable engineering rules that drive component selection, wiring and validation." },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  const { data, isLoading } = useQuery(mastersQuery);
  return (
    <AppShell title="Engineering rules" subtitle="Logic library evaluated on every design run">
      <div className="space-y-2">
        {isLoading ? <p className="label-tech">Loading…</p> : null}
        {(data?.rules ?? []).map((r) => (
          <details key={r.id} className="rounded-sm border bg-card px-4 py-3">
            <summary className="cursor-pointer text-sm">
              <span className="font-mono text-xs text-muted-foreground">{r.rule_code}</span> · {r.name}
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                [{r.category} · p{r.priority}]
              </span>
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
            <pre className="mt-2 overflow-auto rounded-sm bg-muted/50 p-3 font-mono text-xs">
              {JSON.stringify({ conditions: r.conditions, actions: r.actions }, null, 2)}
            </pre>
          </details>
        ))}
      </div>
    </AppShell>
  );
}
