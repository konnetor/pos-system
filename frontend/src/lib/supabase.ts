import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhntubkqjzoftmkknvqr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobnR1YmtxanpvZnRta2tudnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTAxNzAsImV4cCI6MjA1Nzk2NjE3MH0.msCbxM2Zuvjb091xy435EijWPsaEb9HUt93FLEDOUo8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          is_admin: boolean;
          created_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          code: string;
          price: number;
          quantity: number;
          discount: number;
          cost: number;
          created_at: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          code: string;
          price: number;
          description: string | null;
          cost: number;
          created_at: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          mobile: string;
          vehicle_number: string;
          company: string | null;
          total_spent: number;
          visit_count: number;
          last_visit: string;
          created_at: string;
        };
      };
    };
  };
};