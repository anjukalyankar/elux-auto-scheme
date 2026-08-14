import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { mastersQuery } from "@/lib/masters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { runFullEngineering, type FeederInputs } from "@/lib/engineering";

const PROTECTION = ["50", "51", "50N", "51N", "67", "67N", "46", "49", "27", "59", "87", "37", "48", "66"];
const INDICATIONS = [
  ["CB_ON", "CB ON"],
  ["CB_OFF", "CB OFF"],
  ["TRIP", "Trip"],
  ["SPRING_CHARGED", "Spring charged"],
  ["SERVICE_TEST", "Service / Test"],
  ["TRIP_CIRCUIT_HEALTHY", "Trip circuit healthy"],
] as const;

const SAMPLE: FeederInputs = {
  feederType: "MOTOR",
  panelType: "MV_SWITCHGEAR",
  flowDirection: "OUTGOING",
  designOption: "STANDARD",
  voltageKv: 6.6,
  frequencyHz: 50,
  ratedCurrentA: 100,
  motorPowerKw: 800,
  transformerRatingKva: null,
  breakerType: "VCB",
  breakerRatingA: 630,
  protectionFunctions: ["50", "51", "50N", "51N", "67N", "46", "49"],
  earthFaultSource: "CBCT",
  residualVoltageSource: "BUS_VT",
  phaseCtPrimary: 100,
  phaseCtSecondary: 1,
  phaseCtClass: "5P20",
  phaseCtVa: 15,
  phaseCtQuantity: 3,
  cbctPrimary: 50,
  cbctSecondary: 5,
  vtRatio: "6600/110 V",
  relayMaterialCode: "RLY-7SJ6622-1A",
  controlVoltage: "110VDC",
  controlSupplyType: "DC",
  closeCircuitRequired: true,
  tripCircuitRequired: true,
  localRemoteRequired: true,
  tncRequired: true,
  meteringRequired: true,
  conformalCoating: false,
  indications: ["CB_ON", "CB_OFF", "TRIP", "SPRING_CHARGED", "SERVICE_TEST"],
};

const EMPTY: FeederInputs = {
  ...SAMPLE,
  feederType: "MOTOR",
  voltageKv: null,
  ratedCurrentA: null,
  motorPowerKw: null,
  breakerRatingA: null,
  protectionFunctions: [],
  phaseCtPrimary: null,
  phaseCtSecondary: null,
  cbctPrimary: null,
  cbctSecondary: null,
  relayMaterialCode: "",
  indications: [],
  meteringRequired: true,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="label-tech">{label}</Label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border bg-card">
      <h2 className="border-b bg-muted/50 px-4 py-2 font-mono text-xs uppercase tracking-wider">{title}</h2>
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

export function DesignWizard({ module }: { module: "NEW_DESIGN" | "EXTENSION" }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const masters = useQuery(mastersQuery);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState({
    name: "",
    customer: "",
    project_number: "",
    panel_number: "",
    revision: "REV 0",
    engineer: "",
    project_date: new Date().toISOString().slice(0, 10),
    remarks: "",
  });
  const [inputs, setInputs] = useState<FeederInputs>(module === "EXTENSION" ? { ...EMPTY } : { ...EMPTY });

  const relays = (masters.data?.materials ?? []).filter((m) => m.category === "RELAY");

  const derived = useMemo<FeederInputs>(() => {
    const relay = relays.find((r) => r.material_code === inputs.relayMaterialCode);
    const detail = masters.data?.relayDetails.find((d) => d.material_id === relay?.id);
    const supported = detail?.protection_functions ?? [];
    return {
      ...inputs,
      relayInputCurrent: detail ? Number(String(detail.rated_input_current).replace(/[^0-9.]/g, "")) : null,
      relayEarthInputCurrent: detail?.earth_input_current
        ? Number(String(detail.earth_input_current).replace(/[^0-9.]/g, ""))
        : null,
      relayAuxSupply: detail?.aux_supply ?? "",
      relayProtectionFunctions: supported,
      unsupportedProtectionFunctions: detail ? inputs.protectionFunctions.filter((f) => !supported.includes(f)) : [],
    };
  }, [inputs, relays, masters.data]);

  function set<K extends keyof FeederInputs>(key: K, value: FeederInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  function toggle(key: "protectionFunctions" | "indications", value: string) {
    setInputs((prev) => {
      const list = prev[key];
      return { ...prev, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });
  }

  async function generate() {
    if (!masters.data || !user) return;
    if (!project.name.trim()) {
      toast.error("Engineering input required: project name.");
      return;
    }
    setSaving(true);
    try {
      const run = runFullEngineering({
        inputs: derived,
        rules: masters.data.rules,
        materials: masters.data.materials,
        terminalTemplates: masters.data.terminalTemplates,
        symbols: masters.data.symbols,
        project: { name: project.name, panelNumber: project.panel_number, revision: project.revision },
      });

      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          module,
          ...project,
          status: run.validation.approvable ? "GENERATED" : "VALIDATION_ISSUES",
          inputs: derived as never,
          engineering_model: run.model as never,
          rule_results: run.ruleResults as never,
          bom: run.bom as never,
          schematic: run.schematic as never,
          validation: run.validation as never,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success(
        run.validation.approvable
          ? "Engineering complete. BOM and schematic generated."
          : `Generated with ${run.validation.errorCount} validation error(s). Engineering review required.`,
      );
      void navigate({ to: "/projects/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setSaving(false);
    }
  }

  const isExtension = module === "EXTENSION";

  return (
    <AppShell
      title={isExtension ? "Extension panel design" : "New feeder design"}
      subtitle="User input → rule engine → engineering model → BOM + schematic"
      actions={
        <>
          <Button variant="outline" onClick={() => setInputs({ ...SAMPLE })}>
            Load 6.6 kV / 800 kW sample
          </Button>
          <Button onClick={generate} disabled={saving || masters.isLoading}>
            {saving ? "Running rule engine…" : "Run engineering"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Section title="Step 1 · Project information">
          <Field label="Project name">
            <Input value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} />
          </Field>
          <Field label="Customer">
            <Input value={project.customer} onChange={(e) => setProject({ ...project, customer: e.target.value })} />
          </Field>
          <Field label="Project number">
            <Input
              value={project.project_number}
              onChange={(e) => setProject({ ...project, project_number: e.target.value })}
            />
          </Field>
          <Field label="Panel number">
            <Input
              value={project.panel_number}
              onChange={(e) => setProject({ ...project, panel_number: e.target.value })}
            />
          </Field>
          <Field label="Revision">
            <Input value={project.revision} onChange={(e) => setProject({ ...project, revision: e.target.value })} />
          </Field>
          <Field label="Engineer">
            <Input value={project.engineer} onChange={(e) => setProject({ ...project, engineer: e.target.value })} />
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={project.project_date}
              onChange={(e) => setProject({ ...project, project_date: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2 xl:col-span-3">
            <Field label="Remarks">
              <Textarea value={project.remarks} onChange={(e) => setProject({ ...project, remarks: e.target.value })} />
            </Field>
          </div>
        </Section>

        {isExtension ? (
          <Section title="Step 1b · Existing board and extension">
            <Field label="Existing panel number">
              <Input value={inputs.existingPanelNumber ?? ""} onChange={(e) => set("existingPanelNumber", e.target.value)} />
            </Field>
            <Field label="New extension panel number">
              <Input value={inputs.newPanelNumber ?? ""} onChange={(e) => set("newPanelNumber", e.target.value)} />
            </Field>
            <Field label="Existing busbar size">
              <Input value={inputs.existingBusbar ?? ""} onChange={(e) => set("existingBusbar", e.target.value)} />
            </Field>
            <Field label="Extension busbar size">
              <Input value={inputs.extensionBusbar ?? ""} onChange={(e) => set("extensionBusbar", e.target.value)} />
            </Field>
            <Field label="Number of new feeders">
              <Input
                type="number"
                value={inputs.feederQuantity ?? ""}
                onChange={(e) => set("feederQuantity", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
            <Field label="Panel dimensions">
              <Input value={inputs.panelDimensions ?? ""} onChange={(e) => set("panelDimensions", e.target.value)} />
            </Field>
            <Field label="Cable entry">
              <Input value={inputs.cableEntry ?? ""} onChange={(e) => set("cableEntry", e.target.value)} />
            </Field>
            <div className="sm:col-span-2 xl:col-span-3">
              <Field label="Customer specific requirements">
                <Textarea
                  value={inputs.customerRequirements ?? ""}
                  onChange={(e) => set("customerRequirements", e.target.value)}
                />
              </Field>
            </div>
          </Section>
        ) : null}

        <Section title="Step 2 · Feeder information">
          <Field label="Feeder type">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.feederType}
              onChange={(e) => set("feederType", e.target.value as FeederInputs["feederType"])}
            >
              <option value="MOTOR">Motor</option>
              <option value="TRANSFORMER">Transformer</option>
              <option value="INCOMING">Incoming</option>
              <option value="OUTGOING">Outgoing feeder</option>
              <option value="BUS_COUPLER">Bus coupler</option>
            </select>
          </Field>
          <Field label="Panel type">
            <Input value={inputs.panelType} onChange={(e) => set("panelType", e.target.value)} />
          </Field>
          <Field label="Incoming / Outgoing">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.flowDirection}
              onChange={(e) => set("flowDirection", e.target.value)}
            >
              <option value="OUTGOING">Outgoing</option>
              <option value="INCOMING">Incoming</option>
            </select>
          </Field>
          <Field label="Voltage level (kV)">
            <Input
              type="number"
              step="0.1"
              value={inputs.voltageKv ?? ""}
              onChange={(e) => set("voltageKv", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Frequency (Hz)">
            <Input
              type="number"
              value={inputs.frequencyHz ?? ""}
              onChange={(e) => set("frequencyHz", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Rated current (A)">
            <Input
              type="number"
              value={inputs.ratedCurrentA ?? ""}
              onChange={(e) => set("ratedCurrentA", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Motor power (kW)">
            <Input
              type="number"
              value={inputs.motorPowerKw ?? ""}
              onChange={(e) => set("motorPowerKw", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Transformer rating (kVA)">
            <Input
              type="number"
              value={inputs.transformerRatingKva ?? ""}
              onChange={(e) => set("transformerRatingKva", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Breaker type">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.breakerType}
              onChange={(e) => set("breakerType", e.target.value)}
            >
              <option value="VCB">VCB</option>
              <option value="SF6">SF6</option>
              <option value="ACB">ACB</option>
            </select>
          </Field>
          <Field label="Breaker rating (A)">
            <Input
              type="number"
              value={inputs.breakerRatingA ?? ""}
              onChange={(e) => set("breakerRatingA", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Design option">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.designOption}
              onChange={(e) => set("designOption", e.target.value as FeederInputs["designOption"])}
            >
              <option value="STANDARD">Standard</option>
              <option value="ENHANCED">Enhanced</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </Field>
        </Section>

        <Section title="Step 3 · Protection functions">
          <div className="sm:col-span-2 xl:col-span-3">
            <div className="flex flex-wrap gap-2">
              {PROTECTION.map((f) => {
                const on = inputs.protectionFunctions.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggle("protectionFunctions", f)}
                    className={`rounded-sm border px-3 py-1.5 font-mono text-xs ${
                      on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
            {(derived.unsupportedProtectionFunctions?.length ?? 0) > 0 ? (
              <p className="mt-3 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Selected relay does not support: {derived.unsupportedProtectionFunctions?.join(", ")}. Engineering
                review required.
              </p>
            ) : null}
          </div>
          <Field label="Earth fault measurement source">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.earthFaultSource}
              onChange={(e) => set("earthFaultSource", e.target.value)}
            >
              <option value="CBCT">CBCT</option>
              <option value="RESIDUAL">Residual connection of phase CTs</option>
            </select>
          </Field>
          <Field label="Residual / polarising voltage source">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.residualVoltageSource}
              onChange={(e) => set("residualVoltageSource", e.target.value)}
            >
              <option value="">— not defined —</option>
              <option value="BUS_VT">Bus VT (open delta)</option>
              <option value="PANEL_VT_OPEN_DELTA">Panel VT with open delta winding</option>
              <option value="NOT_APPLICABLE">Not applicable</option>
            </select>
          </Field>
        </Section>

        <Section title="Step 4 · CT / CBCT / VT">
          <Field label="Phase CT primary (A)">
            <Input
              type="number"
              value={inputs.phaseCtPrimary ?? ""}
              onChange={(e) => set("phaseCtPrimary", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Phase CT secondary (A)">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.phaseCtSecondary ?? ""}
              onChange={(e) => set("phaseCtSecondary", e.target.value === "" ? null : Number(e.target.value))}
            >
              <option value="">—</option>
              <option value="1">1 A</option>
              <option value="5">5 A</option>
            </select>
          </Field>
          <Field label="CT class">
            <Input value={inputs.phaseCtClass} onChange={(e) => set("phaseCtClass", e.target.value)} />
          </Field>
          <Field label="CT burden (VA)">
            <Input
              type="number"
              value={inputs.phaseCtVa ?? ""}
              onChange={(e) => set("phaseCtVa", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="CT quantity">
            <Input
              type="number"
              value={inputs.phaseCtQuantity ?? ""}
              onChange={(e) => set("phaseCtQuantity", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="CBCT primary (A)">
            <Input
              type="number"
              value={inputs.cbctPrimary ?? ""}
              onChange={(e) => set("cbctPrimary", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="CBCT secondary (A)">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.cbctSecondary ?? ""}
              onChange={(e) => set("cbctSecondary", e.target.value === "" ? null : Number(e.target.value))}
            >
              <option value="">—</option>
              <option value="1">1 A</option>
              <option value="5">5 A</option>
            </select>
          </Field>
          <Field label="VT ratio">
            <Input value={inputs.vtRatio} onChange={(e) => set("vtRatio", e.target.value)} />
          </Field>
        </Section>

        <Section title="Step 5 · Relay selection">
          <div className="sm:col-span-2 xl:col-span-3">
            <Field label="Protection relay (from relay master)">
              <select
                className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
                value={inputs.relayMaterialCode}
                onChange={(e) => set("relayMaterialCode", e.target.value)}
              >
                <option value="">— select relay —</option>
                {relays.map((r) => (
                  <option key={r.id} value={r.material_code}>
                    {r.manufacturer} {r.model} — {r.material_code} ({r.rated_current} inputs, {r.rated_voltage} aux)
                  </option>
                ))}
              </select>
            </Field>
            {derived.relayInputCurrent ? (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Relay phase input {derived.relayInputCurrent}A · earth input {derived.relayEarthInputCurrent ?? "—"}A ·
                aux {derived.relayAuxSupply}
              </p>
            ) : null}
          </div>
        </Section>

        <Section title="Step 6 · Control circuit and indications">
          <Field label="Control voltage">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.controlVoltage}
              onChange={(e) => set("controlVoltage", e.target.value)}
            >
              <option value="110VDC">110 V DC</option>
              <option value="220VDC">220 V DC</option>
              <option value="240VAC">240 V AC</option>
            </select>
          </Field>
          <Field label="Supply type">
            <select
              className="h-9 w-full rounded-sm border bg-background px-2 text-sm"
              value={inputs.controlSupplyType}
              onChange={(e) => set("controlSupplyType", e.target.value as "AC" | "DC")}
            >
              <option value="DC">DC</option>
              <option value="AC">AC</option>
            </select>
          </Field>
          <div className="space-y-2">
            {(
              [
                ["tripCircuitRequired", "Trip circuit required"],
                ["closeCircuitRequired", "Close circuit required"],
                ["tncRequired", "TNC switch required"],
                ["localRemoteRequired", "Local / Remote required"],
                ["meteringRequired", "Metering required"],
                ["conformalCoating", "Conformal coating"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={inputs[key] as boolean}
                  onCheckedChange={(v) => set(key, Boolean(v) as never)}
                />
                {label}
              </label>
            ))}
          </div>
          <div className="sm:col-span-2 xl:col-span-3">
            <Label className="label-tech">Indications</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {INDICATIONS.map(([value, label]) => {
                const on = inputs.indications.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggle("indications", value)}
                    className={`rounded-sm border px-3 py-1.5 text-xs ${
                      on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        <div className="flex justify-end gap-2 pb-6">
          <Button onClick={generate} disabled={saving || masters.isLoading} size="lg">
            {saving ? "Running rule engine…" : "Run engineering, generate BOM & schematic"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
