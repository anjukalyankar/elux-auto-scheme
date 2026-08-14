import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  CircuitBoard,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PanelsTopLeft,
  Ruler,
  Settings,
  SquareStack,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/new-design", label: "New Design", icon: CircuitBoard },
  { to: "/extension-panel", label: "Extension Panel", icon: SquareStack },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/materials", label: "Material Master", icon: Boxes },
  { to: "/rules", label: "Engineering Rules", icon: Ruler },
  { to: "/symbols", label: "Symbols & Terminals", icon: PanelsTopLeft },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="label-tech">Loading engineering workspace…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
          <FileSpreadsheet className="size-5 text-sidebar-primary" />
          <div>
            <p className="font-mono text-sm font-semibold tracking-[0.18em] text-sidebar-accent-foreground">
              ELEXORA
            </p>
            <p className="text-[10px] tracking-wide text-sidebar-foreground/60">
              Electrical engineering automation
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <p className="label-tech text-sidebar-foreground/60">Signed in</p>
          <p className="truncate text-xs text-sidebar-foreground/90">{user.email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => {
              void signOut().then(() => navigate({ to: "/auth" }));
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
