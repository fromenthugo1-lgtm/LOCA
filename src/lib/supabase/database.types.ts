export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          details: NonNullable<Json>;
          id: number;
          target_id: string | null;
          target_table: string | null;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          details?: NonNullable<Json>;
          id?: never;
          target_id?: string | null;
          target_table?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          details?: NonNullable<Json>;
          id?: never;
          target_id?: string | null;
          target_table?: string | null;
        };
        Relationships: [];
      };
      billing_events: {
        Row: {
          company_id: string | null;
          event_type: string;
          id: number;
          payload: NonNullable<Json>;
          processed_at: string | null;
          processing_error: string | null;
          provider: string;
          provider_event_id: string;
          received_at: string;
        };
        ComputedFields: never;
        Insert: {
          company_id?: string | null;
          event_type: string;
          id?: never;
          payload: NonNullable<Json>;
          processed_at?: string | null;
          processing_error?: string | null;
          provider: string;
          provider_event_id: string;
          received_at?: string;
        };
        Update: {
          company_id?: string | null;
          event_type?: string;
          id?: never;
          payload?: NonNullable<Json>;
          processed_at?: string | null;
          processing_error?: string | null;
          provider?: string;
          provider_event_id?: string;
          received_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_events_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          created_at: string;
          id: string;
          legal_identifier: string | null;
          name: string;
          notes: string | null;
          sector: string | null;
          size: string | null;
          status: Database["public"]["Enums"]["company_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          legal_identifier?: string | null;
          name: string;
          notes?: string | null;
          sector?: string | null;
          size?: string | null;
          status?: Database["public"]["Enums"]["company_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          legal_identifier?: string | null;
          name?: string;
          notes?: string | null;
          sector?: string | null;
          size?: string | null;
          status?: Database["public"]["Enums"]["company_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      company_members: {
        Row: {
          company_id: string;
          created_at: string;
          role: Database["public"]["Enums"]["company_role"];
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          company_id: string;
          created_at?: string;
          role?: Database["public"]["Enums"]["company_role"];
          user_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          role?: Database["public"]["Enums"]["company_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      demo_requests: {
        Row: {
          company_name: string;
          company_size: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          internal_notes: string | null;
          ip_hash: string | null;
          job_title: string;
          message: string | null;
          phone: string | null;
          retain_until: string;
          sector: string;
          status: Database["public"]["Enums"]["demo_request_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          company_name: string;
          company_size?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          internal_notes?: string | null;
          ip_hash?: string | null;
          job_title: string;
          message?: string | null;
          phone?: string | null;
          retain_until?: string;
          sector: string;
          status?: Database["public"]["Enums"]["demo_request_status"];
          updated_at?: string;
        };
        Update: {
          company_name?: string;
          company_size?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          internal_notes?: string | null;
          ip_hash?: string | null;
          job_title?: string;
          message?: string | null;
          phone?: string | null;
          retain_until?: string;
          sector?: string;
          status?: Database["public"]["Enums"]["demo_request_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      faq_items: {
        Row: {
          answer: string;
          created_at: string;
          display_order: number;
          id: string;
          is_published: boolean;
          question: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          answer: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_published?: boolean;
          question: string;
          updated_at?: string;
        };
        Update: {
          answer?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_published?: boolean;
          question?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gdpr_requests: {
        Row: {
          channel: string;
          completed_at: string | null;
          created_at: string;
          due_at: string;
          handled_by: string | null;
          id: string;
          identity_method: string | null;
          identity_verified_at: string | null;
          received_at: string;
          request_type: Database["public"]["Enums"]["gdpr_request_type"];
          requester_email: string;
          resolution_note: string | null;
          status: Database["public"]["Enums"]["gdpr_request_status"];
          updated_at: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          channel?: string;
          completed_at?: string | null;
          created_at?: string;
          due_at?: string;
          handled_by?: string | null;
          id?: string;
          identity_method?: string | null;
          identity_verified_at?: string | null;
          received_at?: string;
          request_type: Database["public"]["Enums"]["gdpr_request_type"];
          requester_email: string;
          resolution_note?: string | null;
          status?: Database["public"]["Enums"]["gdpr_request_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          channel?: string;
          completed_at?: string | null;
          created_at?: string;
          due_at?: string;
          handled_by?: string | null;
          id?: string;
          identity_method?: string | null;
          identity_verified_at?: string | null;
          received_at?: string;
          request_type?: Database["public"]["Enums"]["gdpr_request_type"];
          requester_email?: string;
          resolution_note?: string | null;
          status?: Database["public"]["Enums"]["gdpr_request_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      legal_page_versions: {
        Row: {
          body: string;
          id: number;
          published_at: string;
          published_by: string | null;
          slug: string;
          title: string;
          version: string;
        };
        ComputedFields: never;
        Insert: {
          body: string;
          id?: never;
          published_at: string;
          published_by?: string | null;
          slug: string;
          title: string;
          version: string;
        };
        Update: {
          body?: string;
          id?: never;
          published_at?: string;
          published_by?: string | null;
          slug?: string;
          title?: string;
          version?: string;
        };
        Relationships: [];
      };
      legal_pages: {
        Row: {
          body: string;
          published_at: string;
          slug: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
          version: string;
        };
        ComputedFields: never;
        Insert: {
          body: string;
          published_at?: string;
          slug: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
          version: string;
        };
        Update: {
          body?: string;
          published_at?: string;
          slug?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          ai_usage_limit: number | null;
          ai_usage_unit: string | null;
          archived_at: string | null;
          created_at: string;
          currency: string;
          description: string | null;
          display_order: number;
          features: NonNullable<Json>;
          id: string;
          is_published: boolean;
          max_requests_per_month: number | null;
          max_users: number | null;
          monthly_price_cents: number | null;
          name: string;
          provider_monthly_price_id: string | null;
          provider_product_id: string | null;
          provider_setup_price_id: string | null;
          setup_fee_cents: number | null;
          slug: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          ai_usage_limit?: number | null;
          ai_usage_unit?: string | null;
          archived_at?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          display_order?: number;
          features?: NonNullable<Json>;
          id?: string;
          is_published?: boolean;
          max_requests_per_month?: number | null;
          max_users?: number | null;
          monthly_price_cents?: number | null;
          name: string;
          provider_monthly_price_id?: string | null;
          provider_product_id?: string | null;
          provider_setup_price_id?: string | null;
          setup_fee_cents?: number | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          ai_usage_limit?: number | null;
          ai_usage_unit?: string | null;
          archived_at?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          display_order?: number;
          features?: NonNullable<Json>;
          id?: string;
          is_published?: boolean;
          max_requests_per_month?: number | null;
          max_users?: number | null;
          monthly_price_cents?: number | null;
          name?: string;
          provider_monthly_price_id?: string | null;
          provider_product_id?: string | null;
          provider_setup_price_id?: string | null;
          setup_fee_cents?: number | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      platform_admins: {
        Row: {
          granted_at: string;
          note: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          granted_at?: string;
          note?: string | null;
          user_id: string;
        };
        Update: {
          granted_at?: string;
          note?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"];
          anonymized_at: string | null;
          created_at: string;
          deletion_requested_at: string | null;
          deletion_scheduled_for: string | null;
          full_name: string | null;
          id: string;
          terms_accepted_at: string | null;
          terms_version: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"];
          anonymized_at?: string | null;
          created_at?: string;
          deletion_requested_at?: string | null;
          deletion_scheduled_for?: string | null;
          full_name?: string | null;
          id: string;
          terms_accepted_at?: string | null;
          terms_version?: string | null;
          updated_at?: string;
        };
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"];
          anonymized_at?: string | null;
          created_at?: string;
          deletion_requested_at?: string | null;
          deletion_scheduled_for?: string | null;
          full_name?: string | null;
          id?: string;
          terms_accepted_at?: string | null;
          terms_version?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      rate_limit_events: {
        Row: {
          action: string;
          created_at: string;
          id: number;
          key_hash: string;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          created_at?: string;
          id?: never;
          key_hash: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: never;
          key_hash?: string;
        };
        Relationships: [];
      };
      site_content: {
        Row: {
          draft: Json | null;
          key: string;
          published: Json | null;
          published_at: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          draft?: Json | null;
          key: string;
          published?: Json | null;
          published_at?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          draft?: Json | null;
          key?: string;
          published?: Json | null;
          published_at?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          company_id: string;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          ended_at: string | null;
          id: string;
          plan_id: string;
          provider: string | null;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          setup_fee_billed: boolean;
          started_at: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          company_id: string;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          ended_at?: string | null;
          id?: string;
          plan_id: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          setup_fee_billed?: boolean;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          company_id?: string;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          ended_at?: string | null;
          id?: string;
          plan_id?: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          setup_fee_billed?: boolean;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_terms: { Args: { p_version: string }; Returns: undefined };
      admin_anonymize_account: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      admin_cancel_account_deletion: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      admin_export_personal_data: { Args: { p_email: string }; Returns: Json };
      admin_find_account_by_email: {
        Args: { p_email: string };
        Returns: string;
      };
      admin_get_account: {
        Args: { p_user_id: string };
        Returns: {
          account_status: Database["public"]["Enums"]["account_status"];
          anonymized_at: string;
          created_at: string;
          deletion_requested_at: string;
          deletion_scheduled_for: string;
          email: string;
          email_confirmed_at: string;
          full_name: string;
          id: string;
          last_sign_in_at: string;
          terms_accepted_at: string;
          terms_version: string;
        }[];
      };
      admin_list_accounts: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
          p_status?: Database["public"]["Enums"]["account_status"];
        };
        Returns: {
          account_status: Database["public"]["Enums"]["account_status"];
          company_count: number;
          created_at: string;
          deletion_scheduled_for: string;
          email: string;
          email_confirmed_at: string;
          full_name: string;
          id: string;
          last_sign_in_at: string;
        }[];
      };
      admin_list_company_members: {
        Args: { p_company_id: string };
        Returns: {
          account_status: Database["public"]["Enums"]["account_status"];
          created_at: string;
          email: string;
          full_name: string;
          role: Database["public"]["Enums"]["company_role"];
          user_id: string;
        }[];
      };
      admin_log_action: {
        Args: {
          p_action: string;
          p_details?: Json;
          p_target_id: string;
          p_target_table: string;
        };
        Returns: undefined;
      };
      admin_purge_expired_demo_requests: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      admin_schedule_account_deletion: {
        Args: { p_grace_days?: number; p_user_id: string };
        Returns: string;
      };
      admin_set_account_status: {
        Args: {
          p_reason?: string;
          p_status: Database["public"]["Enums"]["account_status"];
          p_user_id: string;
        };
        Returns: undefined;
      };
      admin_view_demo_request: {
        Args: { p_id: string };
        Returns: {
          company_name: string;
          company_size: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          internal_notes: string | null;
          ip_hash: string | null;
          job_title: string;
          message: string | null;
          phone: string | null;
          retain_until: string;
          sector: string;
          status: Database["public"]["Enums"]["demo_request_status"];
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "demo_requests";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      check_rate_limit: {
        Args: {
          p_action: string;
          p_key_hash: string;
          p_max: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
      current_user_is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      purge_rate_limit_events: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      request_account_deletion: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      submit_demo_request: {
        Args: {
          p_company_name: string;
          p_company_size: string;
          p_email: string;
          p_full_name: string;
          p_ip_hash: string;
          p_job_title: string;
          p_message: string;
          p_phone: string;
          p_sector: string;
        };
        Returns: string;
      };
    };
    Enums: {
      account_status: "created" | "onboarding_pending" | "active" | "suspended";
      company_role: "member" | "company_admin";
      company_status: "active" | "suspended" | "archived";
      demo_request_status: "new" | "in_progress" | "done" | "refused";
      gdpr_request_status:
        | "received"
        | "identity_check"
        | "in_progress"
        | "completed"
        | "rejected";
      gdpr_request_type:
        | "access"
        | "rectification"
        | "erasure"
        | "restriction"
        | "portability"
        | "objection"
        | "consent_withdrawal";
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "unpaid"
        | "canceled"
        | "expired"
        | "incomplete";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["created", "onboarding_pending", "active", "suspended"],
      company_role: ["member", "company_admin"],
      company_status: ["active", "suspended", "archived"],
      demo_request_status: ["new", "in_progress", "done", "refused"],
      gdpr_request_status: [
        "received",
        "identity_check",
        "in_progress",
        "completed",
        "rejected",
      ],
      gdpr_request_type: [
        "access",
        "rectification",
        "erasure",
        "restriction",
        "portability",
        "objection",
        "consent_withdrawal",
      ],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "unpaid",
        "canceled",
        "expired",
        "incomplete",
      ],
    },
  },
} as const;
