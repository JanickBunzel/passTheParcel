export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_address_fkey"
            columns: ["address"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          city: string | null
          country: string | null
          geodata: Json
          house_number: string | null
          id: string
          postal_code: string | null
          street: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          geodata: Json
          house_number?: string | null
          id?: string
          postal_code?: string | null
          street?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          geodata?: Json
          house_number?: string | null
          id?: string
          postal_code?: string | null
          street?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          finished: string | null
          from: string
          id: string
          next: string | null
          owner: string | null
          parcel: string
          started: string | null
          to: string | null
        }
        Insert: {
          finished?: string | null
          from: string
          id?: string
          next?: string | null
          owner?: string | null
          parcel: string
          started?: string | null
          to?: string | null
        }
        Update: {
          finished?: string | null
          from?: string
          id?: string
          next?: string | null
          owner?: string | null
          parcel?: string
          started?: string | null
          to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_from_fkey"
            columns: ["from"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_next_fkey"
            columns: ["next"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_parcel_fkey"
            columns: ["parcel"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_to_fkey"
            columns: ["to"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          description: string | null
          destination: string
          id: string
          lat: number | null
          lng: number | null
          owner: string
          receiver: string
          sender: string
          status: Database["public"]["Enums"]["parcel_status"]
          type: Database["public"]["Enums"]["parcel_type"]
          weight: number
        }
        Insert: {
          description?: string | null
          destination: string
          id?: string
          lat?: number | null
          lng?: number | null
          owner: string
          receiver: string
          sender: string
          status?: Database["public"]["Enums"]["parcel_status"]
          type?: Database["public"]["Enums"]["parcel_type"]
          weight: number
        }
        Update: {
          description?: string | null
          destination?: string
          id?: string
          lat?: number | null
          lng?: number | null
          owner?: string
          receiver?: string
          sender?: string
          status?: Database["public"]["Enums"]["parcel_status"]
          type?: Database["public"]["Enums"]["parcel_type"]
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcels_destination_fkey"
            columns: ["destination"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_receiver_fkey"
            columns: ["receiver"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      seed_auth_user: {
        Args: { p_email: string; p_password: string }
        Returns: string
      }
    }
    Enums: {
      parcel_status: "AWAITING_DELIVERY" | "IN_DELIVERY" | "DELIVERED"
      parcel_type: "NORMAL" | "FOOD" | "FRAGILE"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      parcel_status: ["AWAITING_DELIVERY", "IN_DELIVERY", "DELIVERED"],
      parcel_type: ["NORMAL", "FOOD", "FRAGILE"],
    },
  },
} as const

