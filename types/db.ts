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
      booking: {
        Row: {
          booker_id: string | null
          created_at: string | null
          id: string
          service_slot_id: string | null
        }
        Insert: {
          booker_id?: string | null
          created_at?: string | null
          id?: string
          service_slot_id?: string | null
        }
        Update: {
          booker_id?: string | null
          created_at?: string | null
          id?: string
          service_slot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_booker_id_fkey"
            columns: ["booker_id"]
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_service_slot_id_fkey"
            columns: ["service_slot_id"]
            referencedRelation: "service_slot"
            referencedColumns: ["id"]
          }
        ]
      }
      business: {
        Row: {
          created_at: string | null
          description: string | null
          handle: string
          id: string
          inactive: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          handle: string
          id?: string
          inactive?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          handle?: string
          id?: string
          inactive?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      service: {
        Row: {
          booking_limit: number | null
          created_at: string | null
          description: string | null
          id: string
          price: number | null
          service_group_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          booking_limit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          price?: number | null
          service_group_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          booking_limit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          price?: number | null
          service_group_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_service_group_id_fkey"
            columns: ["service_group_id"]
            referencedRelation: "service_group"
            referencedColumns: ["id"]
          }
        ]
      }
      service_group: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          id: string
          is_horizontal: boolean
          priority: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_horizontal?: boolean
          priority?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_horizontal?: boolean
          priority?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_group_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "business"
            referencedColumns: ["id"]
          }
        ]
      }
      service_slot: {
        Row: {
          created_at: string | null
          duration: number
          id: string
          image_url: string | null
          providers: Json | null
          repeat_interval: number | null
          repeat_start: string | null
          service_id: string
          start: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          id?: string
          image_url?: string | null
          providers?: Json | null
          repeat_interval?: number | null
          repeat_start?: string | null
          service_id: string
          start?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          id?: string
          image_url?: string | null
          providers?: Json | null
          repeat_interval?: number | null
          repeat_start?: string | null
          service_id?: string
          start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_slot_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "service"
            referencedColumns: ["id"]
          }
        ]
      }
      service_slot_staff: {
        Row: {
          service_slot_id: string
          staff_id: string
        }
        Insert: {
          service_slot_id: string
          staff_id: string
        }
        Update: {
          service_slot_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_slot_staff_service_slot_id_fkey"
            columns: ["service_slot_id"]
            referencedRelation: "service_slot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_slot_staff_staff_id_fkey"
            columns: ["staff_id"]
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      staff: {
        Row: {
          business_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          image_url: string | null
          instagram_handle: string | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "business"
            referencedColumns: ["id"]
          }
        ]
      }
      user: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_today_business_schedule: {
        Args: {
          business_handle: string
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
}

