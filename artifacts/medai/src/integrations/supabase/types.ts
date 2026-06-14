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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_usage: {
        Row: {
          created_at: string
          function_name: string
          id: string
          ip_address: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          ip_address?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          ip_address?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          content: string
          created_at: string
          id: string
          language: string | null
          role: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          language?: string | null
          role: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          language?: string | null
          role?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medical_journals: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          impact_factor: number | null
          name: string
          publisher: string | null
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          impact_factor?: number | null
          name: string
          publisher?: string | null
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          impact_factor?: number | null
          name?: string
          publisher?: string | null
          url?: string
        }
        Relationships: []
      }
      medical_profiles: {
        Row: {
          age: number | null
          allergies: string | null
          blood_type: string | null
          chronic_conditions: string | null
          created_at: string
          current_medications: string | null
          emergency_contact: string | null
          gender: string | null
          height_cm: number | null
          id: string
          notes: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          current_medications?: string | null
          emergency_contact?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          current_medications?: string | null
          emergency_contact?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      suggestion_likes: {
        Row: {
          created_at: string
          id: string
          suggestion_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_likes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_likes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_replies: {
        Row: {
          author_name: string | null
          created_at: string
          id: string
          is_creator: boolean
          reply_text: string
          suggestion_id: string
          visitor_id: string
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          id?: string
          is_creator?: boolean
          reply_text: string
          suggestion_id: string
          visitor_id: string
        }
        Update: {
          author_name?: string | null
          created_at?: string
          id?: string
          is_creator?: boolean
          reply_text?: string
          suggestion_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_replies_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_replies_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          category: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          original_lang: string | null
          suggestion: string
          suggestion_en: string | null
          suggestion_kk: string | null
          suggestion_ru: string | null
          suggestion_zh: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          original_lang?: string | null
          suggestion: string
          suggestion_en?: string | null
          suggestion_kk?: string | null
          suggestion_ru?: string | null
          suggestion_zh?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          original_lang?: string | null
          suggestion?: string
          suggestion_en?: string | null
          suggestion_kk?: string | null
          suggestion_ru?: string | null
          suggestion_zh?: string | null
        }
        Relationships: []
      }
      symptom_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language: string | null
          result: Json | null
          symptoms: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string | null
          result?: Json | null
          symptoms?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string | null
          result?: Json | null
          symptoms?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_data: Json | null
          created_at: string
          function_name: string
          id: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action_data?: Json | null
          created_at?: string
          function_name: string
          id?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action_data?: Json | null
          created_at?: string
          function_name?: string
          id?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      user_premium: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      suggestions_public: {
        Row: {
          category: string | null
          created_at: string | null
          id: string | null
          name: string | null
          original_lang: string | null
          suggestion: string | null
          suggestion_en: string | null
          suggestion_kk: string | null
          suggestion_ru: string | null
          suggestion_zh: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          original_lang?: string | null
          suggestion?: string | null
          suggestion_en?: string | null
          suggestion_kk?: string | null
          suggestion_ru?: string | null
          suggestion_zh?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          original_lang?: string | null
          suggestion?: string | null
          suggestion_en?: string | null
          suggestion_kk?: string | null
          suggestion_ru?: string | null
          suggestion_zh?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_function_name: string
          p_max_requests?: number
          p_visitor_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_usage: { Args: never; Returns: undefined }
      insert_creator_reply: {
        Args: {
          p_author_name?: string
          p_reply_text: string
          p_suggestion_id: string
        }
        Returns: string
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
