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
      booking_question_answers: {
        Row: {
          booking_id: string
          bool_answer: boolean | null
          created_at: string | null
          multiselect_answer: string[] | null
          question_id: string
          select_answer: string | null
          text_answer: string | null
          type: string
        }
        Insert: {
          booking_id: string
          bool_answer?: boolean | null
          created_at?: string | null
          multiselect_answer?: string[] | null
          question_id: string
          select_answer?: string | null
          text_answer?: string | null
          type: string
        }
        Update: {
          booking_id?: string
          bool_answer?: boolean | null
          created_at?: string | null
          multiselect_answer?: string[] | null
          question_id?: string
          select_answer?: string | null
          text_answer?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_question_answers_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_question_answers_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          booker_id: string | null
          created_at: string | null
          id: string
          service_event_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          booker_id?: string | null
          created_at?: string | null
          id?: string
          service_event_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          booker_id?: string | null
          created_at?: string | null
          id?: string
          service_event_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_booker_id_fkey"
            columns: ["booker_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_event_id_fkey"
            columns: ["service_event_id"]
            referencedRelation: "service_events"
            referencedColumns: ["id"]
          }
        ]
      }
      businesses: {
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
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          booking_id: string | null
          content: string | null
          created_at: string | null
          id: string
          room_id: string
          sender_business_id: string | null
          sender_user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          room_id: string
          sender_business_id?: string | null
          sender_user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          room_id?: string
          sender_business_id?: string | null
          sender_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_business_id_fkey"
            columns: ["sender_business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      chat_rooms_participants: {
        Row: {
          business_id: string
          created_at: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_participants_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_participants_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_participants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          business_id: string
          created_at: string | null
          enabled: boolean | null
          id: string
          options: string[] | null
          question: string
          required: boolean | null
          type: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          options?: string[] | null
          question: string
          required?: boolean | null
          type: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          options?: string[] | null
          question?: string
          required?: boolean | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      service_categories: {
        Row: {
          business_id: string
          color: string
          created_at: string | null
          description: string | null
          id: string
          priority: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          color: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      service_event_live_streams: {
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
            foreignKeyName: "service_event_live_streams_service_event_id_fkey"
            columns: ["service_event_id"]
            referencedRelation: "service_events"
            referencedColumns: ["id"]
          }
        ]
      }
      service_events: {
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
            foreignKeyName: "service_events_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      service_events_staffs: {
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
            foreignKeyName: "service_events_staffs_service_event_id_fkey"
            columns: ["service_event_id"]
            referencedRelation: "service_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_events_staffs_staff_id_fkey"
            columns: ["staff_id"]
            referencedRelation: "staffs"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          booking_limit: number | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          price: number
          service_category_id: string | null
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
          service_category_id?: string | null
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
          service_category_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_service_category_id_fkey"
            columns: ["service_category_id"]
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      services_questions: {
        Row: {
          question_id: string
          service_id: string
        }
        Insert: {
          question_id: string
          service_id: string
        }
        Update: {
          question_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_questions_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_questions_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      staffs: {
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
            foreignKeyName: "staffs_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
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

