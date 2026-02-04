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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      coding_room_participants: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          room_id: string
          session_token: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          room_id: string
          session_token: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          room_id?: string
          session_token?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "coding_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "coding_rooms_public"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_rooms: {
        Row: {
          code: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_private: boolean
          language: string
          last_activity_at: string
          name: string
          session_token: string | null
        }
        Insert: {
          code: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_private?: boolean
          language?: string
          last_activity_at?: string
          name: string
          session_token?: string | null
        }
        Update: {
          code?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_private?: boolean
          language?: string
          last_activity_at?: string
          name?: string
          session_token?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          code: string
          created_at: string
          id: string
          last_activity_at: string
          room_type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          last_activity_at?: string
          room_type?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          last_activity_at?: string
          room_type?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          username: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          username: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          group_id: string
          id: string
          message_type: string
          username: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          group_id: string
          id?: string
          message_type?: string
          username?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          group_id?: string
          id?: string
          message_type?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      pastes: {
        Row: {
          access_code: string | null
          burn_after_read: boolean
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          forked_from: string | null
          id: string
          language: string
          password_hash: string | null
          session_token: string | null
          title: string | null
          views: number
          visibility: string
        }
        Insert: {
          access_code?: string | null
          burn_after_read?: boolean
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          forked_from?: string | null
          id?: string
          language?: string
          password_hash?: string | null
          session_token?: string | null
          title?: string | null
          views?: number
          visibility?: string
        }
        Update: {
          access_code?: string | null
          burn_after_read?: boolean
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          forked_from?: string | null
          id?: string
          language?: string
          password_hash?: string | null
          session_token?: string | null
          title?: string | null
          views?: number
          visibility?: string
        }
        Relationships: []
      }
      room_sessions: {
        Row: {
          created_at: string
          group_id: string
          id: string
          last_seen_at: string
          session_token: string
          username: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          last_seen_at?: string
          session_token: string
          username: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          last_seen_at?: string
          session_token?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      coding_room_participants_public: {
        Row: {
          created_at: string | null
          id: string | null
          last_seen_at: string | null
          room_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          last_seen_at?: string | null
          room_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          last_seen_at?: string | null
          room_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coding_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "coding_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "coding_rooms_public"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_rooms_public: {
        Row: {
          code: string | null
          content: string | null
          created_at: string | null
          id: string | null
          is_private: boolean | null
          language: string | null
          last_activity_at: string | null
          name: string | null
        }
        Insert: {
          code?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_private?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          name?: string | null
        }
        Update: {
          code?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_private?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          name?: string | null
        }
        Relationships: []
      }
      pastes_public: {
        Row: {
          burn_after_read: boolean | null
          content: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          language: string | null
          title: string | null
          views: number | null
          visibility: string | null
        }
        Insert: {
          burn_after_read?: boolean | null
          content?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          language?: string | null
          title?: string | null
          views?: number | null
          visibility?: string | null
        }
        Update: {
          burn_after_read?: boolean | null
          content?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          language?: string | null
          title?: string | null
          views?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_group: {
        Args: { p_code: string }
        Returns: {
          code: string
          created_at: string
          id: string
          room_type: string
        }[]
      }
      create_room_session: {
        Args: { p_group_id: string; p_username: string }
        Returns: boolean
      }
      delete_coding_room: { Args: { room_id: string }; Returns: boolean }
      delete_paste: { Args: { paste_id: string }; Returns: boolean }
      fork_paste: { Args: { source_paste_id: string }; Returns: string }
      generate_paste_access_code: { Args: never; Returns: string }
      get_paste_by_id: {
        Args: { paste_id: string }
        Returns: {
          burn_after_read: boolean
          content: string
          created_at: string
          expires_at: string
          id: string
          is_owner: boolean
          language: string
          requires_password: boolean
          title: string
          views: number
          visibility: string
        }[]
      }
      get_room_by_code: {
        Args: { room_code: string }
        Returns: {
          code: string
          content: string
          created_at: string
          id: string
          is_owner: boolean
          is_private: boolean
          language: string
          last_activity_at: string
          name: string
        }[]
      }
      get_room_participants: {
        Args: { p_group_id: string }
        Returns: {
          created_at: string
          id: string
          last_seen_at: string
          username: string
        }[]
      }
      get_room_participants_safe: {
        Args: { p_room_id: string }
        Returns: {
          created_at: string
          id: string
          last_seen_at: string
          username: string
        }[]
      }
      get_session_token: { Args: never; Returns: string }
      get_verified_username: { Args: never; Returns: string }
      hash_paste_password: { Args: { password: string }; Returns: string }
      hash_session_token: { Args: { token: string }; Returns: string }
      increment_paste_views: { Args: { paste_id: string }; Returns: undefined }
      is_code_lookup: { Args: never; Returns: boolean }
      is_room_creator: { Args: { p_group_id: string }; Returns: boolean }
      join_group_by_code: {
        Args: { p_code: string }
        Returns: {
          code: string
          created_at: string
          id: string
          room_type: string
        }[]
      }
      list_public_pastes: {
        Args: { limit_count?: number }
        Returns: {
          burn_after_read: boolean
          created_at: string
          expires_at: string
          id: string
          language: string
          title: string
          views: number
          visibility: string
        }[]
      }
      list_public_rooms: {
        Args: { limit_count?: number }
        Returns: {
          code: string
          created_at: string
          id: string
          language: string
          last_activity_at: string
          name: string
        }[]
      }
      user_is_in_room: {
        Args: { p_group_id: string; p_session_token: string }
        Returns: boolean
      }
      verify_paste_password: {
        Args: { password: string; paste_id: string }
        Returns: boolean
      }
      view_paste:
        | {
            Args: { paste_id: string }
            Returns: {
              burn_after_read: boolean
              content: string
              created_at: string
              created_by: string
              expires_at: string
              id: string
              language: string
              title: string
              views: number
              visibility: string
            }[]
          }
        | {
            Args: { password?: string; paste_id: string }
            Returns: {
              burn_after_read: boolean
              content: string
              created_at: string
              created_by: string
              expires_at: string
              id: string
              language: string
              requires_password: boolean
              title: string
              views: number
              visibility: string
            }[]
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
    Enums: {},
  },
} as const
