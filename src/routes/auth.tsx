import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ELEXORA Engineering Automation" },
      {
        name: "description",
        content: "Sign in to ELEXORA to design switchgear feeders, generate BOMs and electrical schematics.",
      },
      { property: "og:title", content: "Sign in — ELEXORA Engineering Automation" },
      { property: "og:description", content: "Access your switchgear engineering workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/" });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. You can start engineering now.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      void navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex surface-grid">
        <div>
          <p className="font-mono text-2xl font-semibold tracking-[0.28em] text-sidebar-accent-foreground">ELEXORA</p>
          <p className="mt-2 max-w-md text-sm text-sidebar-foreground/70">
            Switchgear and feeder engineering automation. Engineering inputs in, rule-driven engineering model out —
            with the BOM and the schematic generated from the same source of truth.
          </p>
        </div>
        <ul className="space-y-2 text-sm text-sidebar-foreground/70">
          <li>· Configurable engineering rule engine</li>
          <li>· Database-backed material, symbol and terminal masters</li>
          <li>· Automatic motor feeder BOM and schematic generation</li>
          <li>· BOM and schematic validation before export</li>
        </ul>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-sm border bg-card p-6">
          <div>
            <h1 className="text-lg font-semibold">{mode === "signin" ? "Sign in" : "Create engineer account"}</h1>
            <p className="text-sm text-muted-foreground">Engineering workspace access</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <button
            type="button"
            className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "No account yet? Create one" : "Already registered? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
