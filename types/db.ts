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
          service_event_id: string
        }
        Insert: {
          booker_id?: string | null
          created_at?: string | null
          id?: string
          service_event_id: string
        }
        Update: {
          booker_id?: string | null
          created_at?: string | null
          id?: string
          service_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_booker_id_fkey"
            columns: ["booker_id"]
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_service_event_id_fkey"
            columns: ["service_event_id"]
            referencedRelation: "service_event"
            referencedColumns: ["id"]
          }
        ]
      }
      business: {
        Row: {
          address: string | null
          city: string | null
          country_code: string | null
          cover_photo_url: string | null
          created_at: string | null
          description: string | null
          email: string
          handle: string
          id: string
          inactive: boolean | null
          logo_url: string | null
          owner_id: string
          phone: string | null
          state: string | null
          title: string
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country_code?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          handle: string
          id?: string
          inactive?: boolean | null
          logo_url?: string | null
          owner_id: string
          phone?: string | null
          state?: string | null
          title: string
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country_code?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          handle?: string
          id?: string
          inactive?: boolean | null
          logo_url?: string | null
          owner_id?: string
          phone?: string | null
          state?: string | null
          title?: string
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_owner_id_fkey"
            columns: ["owner_id"]
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
          duration: number
          id: string
          price: number
          service_group_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          booking_limit?: number | null
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          price: number
          service_group_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          booking_limit?: number | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          price?: number
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
      service_event: {
        Row: {
          created_at: string | null
          id: string
          recurrence_count: number | null
          recurrence_interval: number | null
          recurrence_start: string | null
          service_id: string
          start: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recurrence_count?: number | null
          recurrence_interval?: number | null
          recurrence_start?: string | null
          service_id: string
          start: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recurrence_count?: number | null
          recurrence_interval?: number | null
          recurrence_start?: string | null
          service_id?: string
          start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_event_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "service"
            referencedColumns: ["id"]
          }
        ]
      }
      service_event_live_stream: {
        Row: {
          created_at: string
          id: string
          join_url: string | null
          password: string | null
          service_event_id: string | null
          start: string
          start_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          join_url?: string | null
          password?: string | null
          service_event_id?: string | null
          start: string
          start_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          join_url?: string | null
          password?: string | null
          service_event_id?: string | null
          start?: string
          start_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_event_live_stream_service_event_id_fkey"
            columns: ["service_event_id"]
            referencedRelation: "service_event"
            referencedColumns: ["id"]
          }
        ]
      }
      service_event_staff: {
        Row: {
          service_event_id: string
          staff_id: string
        }
        Insert: {
          service_event_id: string
          staff_id: string
        }
        Update: {
          service_event_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_event_staff_service_event_id_fkey"
            columns: ["service_event_id"]
            referencedRelation: "service_event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_event_staff_staff_id_fkey"
            columns: ["staff_id"]
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      service_group: {
        Row: {
          business_id: string
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
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
      staff: {
        Row: {
          business_id: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          instagram_handle: string | null
          last_name: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          instagram_handle?: string | null
          last_name?: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          instagram_handle?: string | null
          last_name?: string
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
          email_verified_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          email_verified_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          email_verified_at?: string | null
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
      get_business_data: {
        Args: {
          business_handle: string
        }
        Returns: Json
      }
      get_business_schedule_in_range: {
        Args: {
          business_handle: string
          start_time: string
          end_time: string
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

