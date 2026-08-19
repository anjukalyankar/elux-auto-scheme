import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import SimpleBomGenerator from "@/components/engineering/SimpleBomGenerator";
import { mastersQuery } from "@/lib/masters";

export function SimpleBomPage() {
  const masters = useQuery(mastersQuery);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Generate BOM</h1>
          <p className="text-muted-foreground">Enter the basic feeder details and generate the BOM.</p>
        </div>
        {masters.isLoading && <p>Loading material master and engineering rules…</p>}
        {masters.isError && <p className="text-destructive">Unable to load the material master. Please check the project data connection and try again.</p>}
        {masters.data && (
          <SimpleBomGenerator
            context={{
              inputs: {} as any,
              materials: masters.data.materials,
              rules: masters.data.rules,
              symbols: masters.data.symbols,
              terminalTemplates: masters.data.terminalTemplates,
              project: { name: "Quick BOM", panelNumber: "BOM-01", revision: "0" },
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
