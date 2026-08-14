import { supabase } from "@/integrations/supabase/client";
import type { EngineeringRule, Material, SymbolDef, TerminalTemplate } from "@/lib/engineering";

export interface RelayDetail {
  material_id: string;
  rated_input_current: string;
  earth_input_current: string | null;
  aux_supply: string;
  protection_functions: string[];
  binary_inputs: number;
  binary_outputs: number;
  communication: string | null;
}

export interface Masters {
  materials: Material[];
  rules: EngineeringRule[];
  symbols: SymbolDef[];
  terminalTemplates: TerminalTemplate[];
  relayDetails: RelayDetail[];
}

export async function fetchMasters(): Promise<Masters> {
  const [materials, rules, symbols, templates, relays] = await Promise.all([
    supabase.from("materials").select("*").order("material_code"),
    supabase.from("engineering_rules").select("*").order("priority"),
    supabase.from("symbols").select("*"),
    supabase.from("terminal_templates").select("*"),
    supabase.from("relay_details").select("*"),
  ]);
  const err = materials.error ?? rules.error ?? symbols.error ?? templates.error ?? relays.error;
  if (err) throw err;
  return {
    materials: (materials.data ?? []) as unknown as Material[],
    rules: (rules.data ?? []) as unknown as EngineeringRule[],
    symbols: (symbols.data ?? []) as unknown as SymbolDef[],
    terminalTemplates: (templates.data ?? []) as unknown as TerminalTemplate[],
    relayDetails: (relays.data ?? []) as unknown as RelayDetail[],
  };
}

export const mastersQuery = {
  queryKey: ["masters"],
  queryFn: fetchMasters,
  staleTime: 60_000,
};

export function money(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}
