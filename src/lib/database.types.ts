export type MovementType = 'in' | 'out';

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          code: string;
          name: string;
          variant: string | null;
          stock: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          variant?: string | null;
          stock?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          variant?: string | null;
          stock?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      movements: {
        Row: {
          id: string;
          product_id: string;
          type: MovementType;
          qty: number;
          user_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          type: MovementType;
          qty: number;
          user_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          type?: MovementType;
          qty?: number;
          user_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { movement_type: MovementType };
    CompositeTypes: Record<string, never>;
  };
}
