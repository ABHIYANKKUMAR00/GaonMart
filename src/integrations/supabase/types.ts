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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          product_image: string
          product_name: string
          product_name_hi: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          product_image?: string
          product_name: string
          product_name_hi?: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_image?: string
          product_name?: string
          product_name_hi?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          buyer_name: string
          buyer_phone: string
          created_at: string
          delivery_partner_id: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          id: string
          order_number: string
          otp: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
          village: string
        }
        Insert: {
          buyer_id: string
          buyer_name: string
          buyer_phone?: string
          created_at?: string
          delivery_partner_id?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          id?: string
          order_number?: string
          otp?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          village: string
        }
        Update: {
          buyer_id?: string
          buyer_name?: string
          buyer_phone?: string
          created_at?: string
          delivery_partner_id?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          id?: string
          order_number?: string
          otp?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          village?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          id: string
          image: string
          in_stock: boolean
          low_stock_threshold: number
          name: string
          name_hi: string
          price: number
          seller_id: string
          stock_quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          image?: string
          in_stock?: boolean
          low_stock_threshold?: number
          name: string
          name_hi?: string
          price: number
          seller_id: string
          stock_quantity?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image?: string
          in_stock?: boolean
          low_stock_threshold?: number
          name?: string
          name_hi?: string
          price?: number
          seller_id?: string
          stock_quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aadhaar_number: string | null
          address: string | null
          bank_details: string | null
          created_at: string
          email: string | null
          hub_location: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          preferred_role: Database["public"]["Enums"]["user_role"]
          registration_complete: boolean | null
          role_type: string | null
          shop_address: string | null
          shop_category: string | null
          shop_name: string | null
          updated_at: string
          user_id: string
          vehicle_type: string | null
          village: string | null
          working_area: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          address?: string | null
          bank_details?: string | null
          created_at?: string
          email?: string | null
          hub_location?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          preferred_role?: Database["public"]["Enums"]["user_role"]
          registration_complete?: boolean | null
          role_type?: string | null
          shop_address?: string | null
          shop_category?: string | null
          shop_name?: string | null
          updated_at?: string
          user_id: string
          vehicle_type?: string | null
          village?: string | null
          working_area?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          address?: string | null
          bank_details?: string | null
          created_at?: string
          email?: string | null
          hub_location?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          preferred_role?: Database["public"]["Enums"]["user_role"]
          registration_complete?: boolean | null
          role_type?: string | null
          shop_address?: string | null
          shop_category?: string | null
          shop_name?: string | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string | null
          village?: string | null
          working_area?: string | null
        }
        Relationships: []
      }
      udhaar_records: {
        Row: {
          amount: number
          buyer_name: string
          buyer_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_paid: boolean
          order_id: string | null
          paid_at: string | null
          seller_id: string
          updated_at: string
          village: string | null
        }
        Insert: {
          amount: number
          buyer_name: string
          buyer_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_paid?: boolean
          order_id?: string | null
          paid_at?: string | null
          seller_id: string
          updated_at?: string
          village?: string | null
        }
        Update: {
          amount?: number
          buyer_name?: string
          buyer_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_paid?: boolean
          order_id?: string | null
          paid_at?: string | null
          seller_id?: string
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "udhaar_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      delivery_type: "scheduled" | "emergency" | "pickup"
      order_status:
        | "pending"
        | "accepted"
        | "packed"
        | "out"
        | "delivered"
        | "rejected"
      payment_method: "upi" | "cod" | "udhaar"
      user_role: "buyer" | "seller" | "delivery" | "hub"
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
    Enums: {
      delivery_type: ["scheduled", "emergency", "pickup"],
      order_status: [
        "pending",
        "accepted",
        "packed",
        "out",
        "delivered",
        "rejected",
      ],
      payment_method: ["upi", "cod", "udhaar"],
      user_role: ["buyer", "seller", "delivery", "hub"],
    },
  },
} as const
