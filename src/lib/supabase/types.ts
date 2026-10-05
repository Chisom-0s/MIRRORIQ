export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          description: string | null;
          category: string;
          image_url: string;
          price: string;
          color: string | null;
          occasion: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          description?: string | null;
          category: string;
          image_url: string;
          price: string;
          color?: string | null;
          occasion?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          description?: string | null;
          category?: string;
          image_url?: string;
          price?: string;
          color?: string | null;
          occasion?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      analysis_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          selfie_url: string;
          status: "pending" | "processing" | "completed" | "failed";
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          selfie_url: string;
          status?: "pending" | "processing" | "completed" | "failed";
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          selfie_url?: string;
          status?: "pending" | "processing" | "completed" | "failed";
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      skin_analyses: {
        Row: {
          id: string;
          session_id: string;
          skin_type: string | null;
          overall_score: number | null;
          analysis_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          skin_type?: string | null;
          overall_score?: number | null;
          analysis_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          skin_type?: string | null;
          overall_score?: number | null;
          analysis_data?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "skin_analyses_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "analysis_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      try_on_results: {
        Row: {
          id: string;
          session_id: string;
          product_id: string | null;
          source_image_url: string;
          result_image_url: string | null;
          youcam_task_id: string | null;
          status: "running" | "success" | "error";
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          product_id?: string | null;
          source_image_url: string;
          result_image_url?: string | null;
          youcam_task_id?: string | null;
          status?: "running" | "success" | "error";
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          product_id?: string | null;
          source_image_url?: string;
          result_image_url?: string | null;
          youcam_task_id?: string | null;
          status?: "running" | "success" | "error";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "try_on_results_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "analysis_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "try_on_results_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      decision_reports: {
        Row: {
          id: string;
          session_id: string;
          product_id: string | null;
          confidence_score: number;
          visual_score: number | null;
          occasion_score: number | null;
          preference_score: number | null;
          versatility_score: number | null;
          recommendation: string | null;
          explanation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          product_id?: string | null;
          confidence_score: number;
          visual_score?: number | null;
          occasion_score?: number | null;
          preference_score?: number | null;
          versatility_score?: number | null;
          recommendation?: string | null;
          explanation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          product_id?: string | null;
          confidence_score?: number;
          visual_score?: number | null;
          occasion_score?: number | null;
          preference_score?: number | null;
          versatility_score?: number | null;
          recommendation?: string | null;
          explanation?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decision_reports_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "analysis_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "decision_reports_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      comparisons: {
        Row: {
          id: string;
          session_id: string;
          product_a_id: string | null;
          product_b_id: string | null;
          score_a: number | null;
          score_b: number | null;
          winner_product_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          product_a_id?: string | null;
          product_b_id?: string | null;
          score_a?: number | null;
          score_b?: number | null;
          winner_product_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          product_a_id?: string | null;
          product_b_id?: string | null;
          score_a?: number | null;
          score_b?: number | null;
          winner_product_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comparisons_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "analysis_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comparisons_product_a_id_fkey";
            columns: ["product_a_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comparisons_product_b_id_fkey";
            columns: ["product_b_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comparisons_winner_product_id_fkey";
            columns: ["winner_product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
