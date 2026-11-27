export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          settings?: Json
          created_at?: string
        }
      }
      household_members: {
        Row: {
          household_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at: string
        }
        Insert: {
          household_id: string
          user_id: string
          role?: 'owner' | 'member'
          joined_at?: string
        }
        Update: {
          household_id?: string
          user_id?: string
          role?: 'owner' | 'member'
          joined_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          household_id: string
          name: string
          icon: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          icon?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          household_id: string
          name: string
          default_tracking_type: 'units' | 'level' | 'presence'
          default_shelf_life_days: number | null
          default_days_after_opening: number | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          default_tracking_type?: 'units' | 'level' | 'presence'
          default_shelf_life_days?: number | null
          default_days_after_opening?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          default_tracking_type?: 'units' | 'level' | 'presence'
          default_shelf_life_days?: number | null
          default_days_after_opening?: number | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          household_id: string
          name: string
          category_id: string | null
          tracking_type: 'units' | 'level' | 'presence'
          barcode: string | null
          default_location_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          category_id?: string | null
          tracking_type?: 'units' | 'level' | 'presence'
          barcode?: string | null
          default_location_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          category_id?: string | null
          tracking_type?: 'units' | 'level' | 'presence'
          barcode?: string | null
          default_location_id?: string | null
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          household_id: string
          product_id: string
          location_id: string | null
          purchased_at: string | null
          expiry_date: string | null
          opened_at: string | null
          days_after_opening: number | null
          quantity: number | null
          level: 'full' | 'half' | 'low' | 'empty' | null
          has_it: boolean | null
          status: 'active' | 'consumed' | 'discarded'
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          product_id: string
          location_id?: string | null
          purchased_at?: string | null
          expiry_date?: string | null
          opened_at?: string | null
          days_after_opening?: number | null
          quantity?: number | null
          level?: 'full' | 'half' | 'low' | 'empty' | null
          has_it?: boolean | null
          status?: 'active' | 'consumed' | 'discarded'
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          product_id?: string
          location_id?: string | null
          purchased_at?: string | null
          expiry_date?: string | null
          opened_at?: string | null
          days_after_opening?: number | null
          quantity?: number | null
          level?: 'full' | 'half' | 'low' | 'empty' | null
          has_it?: boolean | null
          status?: 'active' | 'consumed' | 'discarded'
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shopping_list_items: {
        Row: {
          id: string
          household_id: string
          product_id: string | null
          name: string
          checked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          product_id?: string | null
          name: string
          checked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          product_id?: string | null
          name?: string
          checked?: boolean
          created_at?: string
        }
      }
      item_events: {
        Row: {
          id: string
          household_id: string
          item_id: string | null
          type: 'created' | 'level_changed' | 'quantity_changed' | 'opened' | 'consumed' | 'discarded'
          payload: Json | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          item_id?: string | null
          type: 'created' | 'level_changed' | 'quantity_changed' | 'opened' | 'consumed' | 'discarded'
          payload?: Json | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          item_id?: string | null
          type?: 'created' | 'level_changed' | 'quantity_changed' | 'opened' | 'consumed' | 'discarded'
          payload?: Json | null
          user_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
