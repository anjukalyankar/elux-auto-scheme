import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ELEXORA" },
      { name: "description", content: "Account and workspace settings for the ELEXORA switchgear engineering platform." },
      { property: "og:title", content: "Settings — ELEXORA" },
      { property: "og:description", content: "Account and workspace settings for the ELEXORA switchgear engineering platform." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  return (
    <AppShell title="Settings" subtitle="Workspace and account">
      <div className="rounded-sm border bg-card p-4 text-sm">
        <p className="label-tech">Signed in as</p>
        <p className="mt-1 font-mono">{user?.email}</p>
      </div>
    </AppShell>
  );
}
