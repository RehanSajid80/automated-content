export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          encrypted_key: string
          id: string
          is_active: boolean | null
          key_name: string
          service_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          encrypted_key: string
          id?: string
          is_active?: boolean | null
          key_name: string
          service_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          encrypted_key?: string
          id?: string
          is_active?: boolean | null
          key_name?: string
          service_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          country_id: number | null
          id: number
          name: string
        }
        Insert: {
          country_id?: number | null
          id?: never
          name: string
        }
        Update: {
          country_id?: number | null
          id?: never
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      content_embeddings: {
        Row: {
          content_id: string | null
          content_text: string
          content_type: string
          created_at: string
          embedding: string | null
          id: string
          keywords: string[] | null
          metadata: Json | null
          topic_area: string | null
          updated_at: string
        }
        Insert: {
          content_id?: string | null
          content_text: string
          content_type: string
          created_at?: string
          embedding?: string | null
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          topic_area?: string | null
          updated_at?: string
        }
        Update: {
          content_id?: string | null
          content_text?: string
          content_type?: string
          created_at?: string
          embedding?: string | null
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          topic_area?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_embeddings_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_library"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          is_saved: boolean | null
          is_selected: boolean | null
          keywords: string[] | null
          title: string | null
          topic_area: string | null
          updated_at: string
        }
        Insert: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          is_saved?: boolean | null
          is_selected?: boolean | null
          keywords?: string[] | null
          title?: string | null
          topic_area?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          is_saved?: boolean | null
          is_selected?: boolean | null
          keywords?: string[] | null
          title?: string | null
          topic_area?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      misc: {
        Row: {
          adjustment_instructions: string | null
          content: string
          created_at: string
          id: string
          original_content_id: string | null
          target_format: string | null
          target_persona: string | null
          title: string
          updated_at: string
        }
        Insert: {
          adjustment_instructions?: string | null
          content: string
          created_at?: string
          id?: string
          original_content_id?: string | null
          target_format?: string | null
          target_persona?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          adjustment_instructions?: string | null
          content?: string
          created_at?: string
          id?: string
          original_content_id?: string | null
          target_format?: string | null
          target_persona?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      semrush_keywords: {
        Row: {
          cache_key: string
          cpc: number | null
          created_at: string
          difficulty: number | null
          domain: string | null
          id: string
          keyword: string
          topic_area: string | null
          trend: string | null
          updated_at: string
          volume: number | null
        }
        Insert: {
          cache_key: string
          cpc?: number | null
          created_at?: string
          difficulty?: number | null
          domain?: string | null
          id?: string
          keyword: string
          topic_area?: string | null
          trend?: string | null
          updated_at?: string
          volume?: number | null
        }
        Update: {
          cache_key?: string
          cpc?: number | null
          created_at?: string
          difficulty?: number | null
          domain?: string | null
          id?: string
          keyword?: string
          topic_area?: string | null
          trend?: string | null
          updated_at?: string
          volume?: number | null
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          is_global: boolean | null
          type: string | null
          updated_at: string
          url: string | null
          webhook_type: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          type?: string | null
          updated_at?: string
          url?: string | null
          webhook_type: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          type?: string | null
          updated_at?: string
          url?: string | null
          webhook_type?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      exec_sql: {
        Args: { sql: string; params?: Json }
        Returns: Json
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_content_embeddings: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          content_type_filter?: string
          topic_area_filter?: string
        }
        Returns: {
          id: string
          content_id: string
          content_text: string
          content_type: string
          topic_area: string
          keywords: string[]
          metadata: Json
          similarity: number
          content_library: Json
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
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
