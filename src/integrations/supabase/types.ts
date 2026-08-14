export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      breaker_details: {
        Row: {
          aux_contacts: string | null
          breaker_type: string
          breaking_capacity_ka: number | null
          closing_coil_voltage: string | null
          material_id: string
          rated_current_a: number
          rated_voltage_kv: number
          trip_coil_voltage: string | null
        }
        Insert: {
          aux_contacts?: string | null
          breaker_type: string
          breaking_capacity_ka?: number | null
          closing_coil_voltage?: string | null
          material_id: string
          rated_current_a: number
          rated_voltage_kv: number
          trip_coil_voltage?: string | null
        }
        Update: {
          aux_contacts?: string | null
          breaker_type?: string
          breaking_capacity_ka?: number | null
          closing_coil_voltage?: string | null
          material_id?: string
          rated_current_a?: number
          rated_voltage_kv?: number
          trip_coil_voltage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "breaker_details_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: true
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_details: {
        Row: {
          accuracy_class: string | null
          burden_va: number | null
          cores: number
          ct_type: string
          material_id: string
          primary_current: number
          protection_class: string | null
          secondary_current: number
        }
        Insert: {
          accuracy_class?: string | null
          burden_va?: number | null
          cores?: number
          ct_type: string
          material_id: string
          primary_current: number
          protection_class?: string | null
          secondary_current: number
        }
        Update: {
          accuracy_class?: string | null
          burden_va?: number | null
          cores?: number
          ct_type?: string
          material_id?: string
          primary_current?: number
          protection_class?: string | null
          secondary_current?: number
        }
        Relationships: [
          {
            foreignKeyName: "ct_details_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: true
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      engineering_rules: {
        Row: {
          actions: Json
          active: boolean
          category: string
          conditions: Json
          created_at: string
          description: string | null
          design_options: string[]
          id: string
          name: string
          priority: number
          rule_code: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          active?: boolean
          category?: string
          conditions?: Json
          created_at?: string
          description?: string | null
          design_options?: string[]
          id?: string
          name: string
          priority?: number
          rule_code: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          active?: boolean
          category?: string
          conditions?: Json
          created_at?: string
          description?: string | null
          design_options?: string[]
          id?: string
          name?: string
          priority?: number
          rule_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          active: boolean
          attributes: Json
          category: string
          component_type: string
          created_at: string
          description: string
          id: string
          manufacturer: string | null
          material_code: string
          model: string | null
          rated_current: string | null
          rated_voltage: string | null
          symbol_id: string | null
          terminal_template_id: string | null
          unit: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          attributes?: Json
          category: string
          component_type: string
          created_at?: string
          description: string
          id?: string
          manufacturer?: string | null
          material_code: string
          model?: string | null
          rated_current?: string | null
          rated_voltage?: string | null
          symbol_id?: string | null
          terminal_template_id?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          attributes?: Json
          category?: string
          component_type?: string
          created_at?: string
          description?: string
          id?: string
          manufacturer?: string | null
          material_code?: string
          model?: string | null
          rated_current?: string | null
          rated_voltage?: string | null
          symbol_id?: string | null
          terminal_template_id?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_symbol_id_fkey"
            columns: ["symbol_id"]
            isOneToOne: false
            referencedRelation: "symbols"
            referencedColumns: ["symbol_id"]
          },
          {
            foreignKeyName: "materials_terminal_template_id_fkey"
            columns: ["terminal_template_id"]
            isOneToOne: false
            referencedRelation: "terminal_templates"
            referencedColumns: ["template_id"]
          },
        ]
      }
      projects: {
        Row: {
          bom: Json | null
          created_at: string
          customer: string | null
          engineer: string | null
          engineering_model: Json | null
          id: string
          inputs: Json
          module: string
          name: string
          panel_number: string | null
          project_date: string | null
          project_number: string | null
          remarks: string | null
          revision: string
          rule_results: Json | null
          schematic: Json | null
          status: string
          updated_at: string
          user_id: string
          validation: Json | null
        }
        Insert: {
          bom?: Json | null
          created_at?: string
          customer?: string | null
          engineer?: string | null
          engineering_model?: Json | null
          id?: string
          inputs?: Json
          module?: string
          name: string
          panel_number?: string | null
          project_date?: string | null
          project_number?: string | null
          remarks?: string | null
          revision?: string
          rule_results?: Json | null
          schematic?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          validation?: Json | null
        }
        Update: {
          bom?: Json | null
          created_at?: string
          customer?: string | null
          engineer?: string | null
          engineering_model?: Json | null
          id?: string
          inputs?: Json
          module?: string
          name?: string
          panel_number?: string | null
          project_date?: string | null
          project_number?: string | null
          remarks?: string | null
          revision?: string
          rule_results?: Json | null
          schematic?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          validation?: Json | null
        }
        Relationships: []
      }
      relay_details: {
        Row: {
          aux_supply: string
          binary_inputs: number
          binary_outputs: number
          communication: string | null
          earth_input_current: string | null
          material_id: string
          protection_functions: string[]
          rated_input_current: string
        }
        Insert: {
          aux_supply: string
          binary_inputs?: number
          binary_outputs?: number
          communication?: string | null
          earth_input_current?: string | null
          material_id: string
          protection_functions?: string[]
          rated_input_current: string
        }
        Update: {
          aux_supply?: string
          binary_inputs?: number
          binary_outputs?: number
          communication?: string | null
          earth_input_current?: string | null
          material_id?: string
          protection_functions?: string[]
          rated_input_current?: string
        }
        Relationships: [
          {
            foreignKeyName: "relay_details_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: true
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      symbols: {
        Row: {
          component_type: string
          created_at: string
          height: number
          orientation: string
          pins: Json
          symbol_id: string
          symbol_name: string
          width: number
        }
        Insert: {
          component_type: string
          created_at?: string
          height?: number
          orientation?: string
          pins?: Json
          symbol_id: string
          symbol_name: string
          width?: number
        }
        Update: {
          component_type?: string
          created_at?: string
          height?: number
          orientation?: string
          pins?: Json
          symbol_id?: string
          symbol_name?: string
          width?: number
        }
        Relationships: []
      }
      terminal_templates: {
        Row: {
          component_type: string
          created_at: string
          name: string
          template_id: string
          terminals: Json
        }
        Insert: {
          component_type: string
          created_at?: string
          name: string
          template_id: string
          terminals?: Json
        }
        Update: {
          component_type?: string
          created_at?: string
          name?: string
          template_id?: string
          terminals?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
