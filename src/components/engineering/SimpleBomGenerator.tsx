import { useMemo, useState } from "react";
import { generateBom, runEngineering, type RunContext } from "@/lib/engineering";

export default function SimpleBomGenerator({ context }: { context: Omit<RunContext, "input"> }) {
  const [feederType, setFeederType] = useState("TRANSFORMER");
  const [voltageKv, setVoltageKv] = useState("6.6");
  const [ratedCurrentA, setRatedCurrentA] = useState("1250");
  const [breakerType, setBreakerType] = useState("VCB");
  const [controlVoltage, setControlVoltage] = useState("110 VDC");
  const [relayMaterialCode, setRelayMaterialCode] = useState("7SJ6622");
  const [ctRatio, setCtRatio] = useState("1250/1 A");
  const [result, setResult] = useState<ReturnType<typeof generateBom> | null>(null);

  const relayOptions = useMemo(() => context.materials.filter(m => /relay/i.test(m.category) || /7SJ66/i.test(m.material_code + " " + m.description)), [context.materials]);

  function generate() {
    const [primary, secondary] = ctRatio.replace(/\s/g, "").replace(/A/gi, "").split("/").map(Number);
    const { model } = runEngineering({
      ...context,
      input: {
        feederType: feederType as any,
        panelType: "",
        flowDirection: "",
        designOption: "STANDARD",
        voltageKv: Number(voltageKv) || null,
        frequencyHz: 50,
        ratedCurrentA: Number(ratedCurrentA) || null,
        motorPowerKw: null,
        transformerRatingKva: null,
        breakerType,
        breakerRatingA: Number(ratedCurrentA) || null,
        protectionFunctions: [],
        earthFaultSource: "",
        residualVoltageSource: "",
        phaseCtPrimary: Number.isFinite(primary) ? primary : null,
        phaseCtSecondary: Number.isFinite(secondary) ? secondary : null,
        phaseCtClass: "",
        phaseCtVa: null,
        phaseCtQuantity: null,
        cbctPrimary: null,
        cbctSecondary: null,
        vtRatio: "",
        relayMaterialCode,
        controlVoltage,
        controlSupplyType: controlVoltage.includes("DC") ? "DC" : "AC",
        closeCircuitRequired: true,
        tripCircuitRequired: true,
        localRemoteRequired: true,
        tncRequired: true,
        meteringRequired: true,
        conformalCoating: false,
        indications: [],
      },
    });
    setResult(generateBom(model));
  }

  const exportCsv = () => {
    if (!result) return;
    const rows = [["Material Code","Description","Make","Qty","Unit Price","Total Price"], ...result.lines.map(l => [l.materialCode || "Material mapping pending", l.description, l.manufacturer || "", l.quantity, l.unitPrice ?? "", l.totalPrice ?? ""])];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "elexora-bom.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <label>Feeder Type<select value={feederType} onChange={e=>setFeederType(e.target.value)}><option value="TRANSFORMER">Transformer</option><option value="MOTOR">Motor</option><option value="INCOMING">Incoming</option><option value="OUTGOING">Outgoing</option></select></label>
      <label>Voltage (kV)<input value={voltageKv} onChange={e=>setVoltageKv(e.target.value)} /></label>
      <label>Current (A)<input value={ratedCurrentA} onChange={e=>setRatedCurrentA(e.target.value)} /></label>
      <label>Breaker<input value={breakerType} onChange={e=>setBreakerType(e.target.value)} /></label>
      <label>Control Voltage<input value={controlVoltage} onChange={e=>setControlVoltage(e.target.value)} /></label>
      <label>Relay<select value={relayMaterialCode} onChange={e=>setRelayMaterialCode(e.target.value)}><option value="7SJ6622">7SJ6622</option>{relayOptions.map(r=><option key={r.id} value={r.material_code}>{r.material_code} — {r.description}</option>)}</select></label>
      <label>CT Ratio <span className="text-muted-foreground">(for metering if needed)</span><input value={ctRatio} onChange={e=>setCtRatio(e.target.value)} placeholder="1250/1 A" /></label>
    </div>
    <button type="button" onClick={generate}>Generate BOM</button>
    {result && <div className="space-y-3">
      <div className="flex gap-6"><span>Total Components: {result.totalComponents}</span><span>Total Qty: {result.totalQuantity}</span><span>Total BOM Cost: ₹{result.totalCost.toLocaleString("en-IN")}</span><button type="button" onClick={exportCsv}>Export CSV</button></div>
      <div className="overflow-auto"><table><thead><tr><th>Material Code</th><th>Description</th><th>Make</th><th>Qty</th><th>Unit Price</th><th>Total Price</th></tr></thead><tbody>{result.lines.map((l,i)=><tr key={i}><td>{l.materialCode || "Material mapping pending"}</td><td>{l.description}</td><td>{l.manufacturer || ""}</td><td>{l.quantity}</td><td>{l.unitPrice ?? ""}</td><td>{l.totalPrice ?? ""}</td></tr>)}</tbody></table></div>
    </div>}
  </div>;
}
