export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          evidence: Json
          mission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence: Json
          mission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "private_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_action_summary: {
        Row: {
          count: number
          created_at: string
          date: string
        }
        Insert: {
          count: number
          created_at?: string
          date: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
        }
        Relationships: []
      }
      daily_dashboard_registration_by_prefecture_summary: {
        Row: {
          count: number
          created_at: string
          date: string
          prefecture: string
        }
        Insert: {
          count: number
          created_at?: string
          date: string
          prefecture: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          prefecture?: string
        }
        Relationships: []
      }
      daily_dashboard_registration_summary: {
        Row: {
          count: number
          created_at: string
          date: string
        }
        Insert: {
          count: number
          created_at?: string
          date: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          id: string
          starts_at: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id: string
          starts_at: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          starts_at?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          content: string | null
          created_at: string
          icon_url: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          icon_url?: string | null
          id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          icon_url?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string
          id: number
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      private_users: {
        Row: {
          address_prefecture: string
          auth_id: string
          created_at: string
          id: string
          name: string
          postcode: string
          updated_at: string
          x_username: string | null
        }
        Insert: {
          address_prefecture: string
          auth_id: string
          created_at?: string
          id: string
          name: string
          postcode: string
          updated_at?: string
          x_username?: string | null
        }
        Update: {
          address_prefecture?: string
          auth_id?: string
          created_at?: string
          id?: string
          name?: string
          postcode?: string
          updated_at?: string
          x_username?: string | null
        }
        Relationships: []
      }
      weekly_event_count_by_prefecture_summary: {
        Row: {
          count: number
          created_at: string
          date: string
          prefecture: string
        }
        Insert: {
          count: number
          created_at?: string
          date: string
          prefecture: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          prefecture?: string
        }
        Relationships: []
      }
      weekly_event_count_summary: {
        Row: {
          count: number
          created_at: string
          date: string
        }
        Insert: {
          count: number
          created_at?: string
          date: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_users: {
        Row: {
          address_prefecture: string | null
          created_at: string | null
          id: string | null
          name: string | null
          x_username: string | null
        }
        Insert: {
          address_prefecture?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          x_username?: string | null
        }
        Update: {
          address_prefecture?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          x_username?: string | null
        }
        Relationships: []
      }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
