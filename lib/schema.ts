export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      keys: {
        Row: {
          id: string
          iv: string | null
          key_data: Json | null
          path: string
          user_id: string
        }
        Insert: {
          id?: string
          iv?: string | null
          key_data?: Json | null
          path: string
          user_id: string
        }
        Update: {
          id?: string
          iv?: string | null
          key_data?: Json | null
          path?: string
          user_id?: string
        }
      }
      trash: {
        Row: {
          date_added: string | null
          id: string
          key_id: string
          previous_path: string
        }
        Insert: {
          date_added?: string | null
          id?: string
          key_id: string
          previous_path: string
        }
        Update: {
          date_added?: string | null
          id?: string
          key_id?: string
          previous_path?: string
        }
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

