export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      movements: {
        Row: {
          created_at: string;
          customer: string | null;
          id: string;
          note: string | null;
          product_id: string;
          qty: number;
          type: Database['public']['Enums']['movement_type'];
          unit_price: number | null;
          user_email: string | null;
          user_id: string | null;
          warehouse_id: string;
        };
        Insert: {
          created_at?: string;
          customer?: string | null;
          id?: string;
          note?: string | null;
          product_id: string;
          qty: number;
          type: Database['public']['Enums']['movement_type'];
          unit_price?: number | null;
          user_email?: string | null;
          user_id?: string | null;
          warehouse_id: string;
        };
        Update: {
          created_at?: string;
          customer?: string | null;
          id?: string;
          note?: string | null;
          product_id?: string;
          qty?: number;
          type?: Database['public']['Enums']['movement_type'];
          unit_price?: number | null;
          user_email?: string | null;
          user_id?: string | null;
          warehouse_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'movements_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'product_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'movements_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'movements_warehouse_id_fkey';
            columns: ['warehouse_id'];
            isOneToOne: false;
            referencedRelation: 'warehouses';
            referencedColumns: ['id'];
          },
        ];
      };
      product_groups: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          position: number | null;
          warehouse_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          position?: number | null;
          warehouse_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          position?: number | null;
          warehouse_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_groups_warehouse_id_fkey';
            columns: ['warehouse_id'];
            isOneToOne: false;
            referencedRelation: 'warehouses';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          archived_at: string | null;
          code: string;
          created_at: string;
          group_id: string | null;
          id: string;
          min_stock: number;
          name: string;
          notes: string | null;
          position: number | null;
          price: number;
          sale_kind: Database['public']['Enums']['sale_kind'];
          stock: number;
          updated_at: string;
          variant: string | null;
          warehouse_id: string;
        };
        Insert: {
          archived_at?: string | null;
          code: string;
          created_at?: string;
          group_id?: string | null;
          id?: string;
          min_stock?: number;
          name: string;
          notes?: string | null;
          position?: number | null;
          price?: number;
          sale_kind?: Database['public']['Enums']['sale_kind'];
          stock?: number;
          updated_at?: string;
          variant?: string | null;
          warehouse_id: string;
        };
        Update: {
          archived_at?: string | null;
          code?: string;
          created_at?: string;
          group_id?: string | null;
          id?: string;
          min_stock?: number;
          name?: string;
          notes?: string | null;
          position?: number | null;
          price?: number;
          sale_kind?: Database['public']['Enums']['sale_kind'];
          stock?: number;
          updated_at?: string;
          variant?: string | null;
          warehouse_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'product_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'products_warehouse_id_fkey';
            columns: ['warehouse_id'];
            isOneToOne: false;
            referencedRelation: 'warehouses';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          role?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
      van_checklists: {
        Row: {
          created_at: string;
          id: string;
          items: Json;
          note: string | null;
          user_email: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          items: Json;
          note?: string | null;
          user_email?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          items?: Json;
          note?: string | null;
          user_email?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      warehouse_members: {
        Row: {
          created_at: string;
          user_id: string;
          warehouse_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
          warehouse_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
          warehouse_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'warehouse_members_warehouse_id_fkey';
            columns: ['warehouse_id'];
            isOneToOne: false;
            referencedRelation: 'warehouses';
            referencedColumns: ['id'];
          },
        ];
      };
      warehouses: {
        Row: {
          archived_at: string | null;
          created_at: string;
          id: string;
          name: string;
          position: number | null;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          position?: number | null;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          position?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      product_stats: {
        Row: {
          archived_at: string | null;
          code: string | null;
          id: string | null;
          is_low: boolean | null;
          is_out: boolean | null;
          last_movement_at: string | null;
          min_stock: number | null;
          movements_count: number | null;
          name: string | null;
          price: number | null;
          sale_kind: Database['public']['Enums']['sale_kind'] | null;
          stock: number | null;
          total_in: number | null;
          total_out: number | null;
          total_revenue: number | null;
          variant: string | null;
          warehouse_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'products_warehouse_id_fkey';
            columns: ['warehouse_id'];
            isOneToOne: false;
            referencedRelation: 'warehouses';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      can_access_warehouse: { Args: { target: string }; Returns: boolean };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      movement_type: 'in' | 'out';
      sale_kind: 'contrato' | 'pieza';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      movement_type: ['in', 'out'],
      sale_kind: ['contrato', 'pieza'],
    },
  },
} as const;
