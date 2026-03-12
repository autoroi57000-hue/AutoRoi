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
      activity_logs: {
        Row: {
          action_type: string
          company_id: string | null
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          answer: string
          company_id: string
          created_at: string
          id: string
          question: string
          tokens_used: number | null
        }
        Insert: {
          answer: string
          company_id: string
          created_at?: string
          id?: string
          question: string
          tokens_used?: number | null
        }
        Update: {
          answer?: string
          company_id?: string
          created_at?: string
          id?: string
          question?: string
          tokens_used?: number | null
        }
        Relationships: []
      }
      ai_predictions: {
        Row: {
          actual_failure_occurred: boolean | null
          confidence_score: number | null
          created_at: string | null
          estimated_roi: number | null
          failure_probability: number
          features_used: Json | null
          feedback_notes: string | null
          feedback_provided_at: string | null
          id: string
          model_version: string | null
          predicted_failure_type: string | null
          prediction_horizon_days: number | null
          recommended_action: string | null
          risk_factors: string[] | null
          updated_at: string | null
          urgency_level: string | null
          vehicle_id: string
        }
        Insert: {
          actual_failure_occurred?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          estimated_roi?: number | null
          failure_probability: number
          features_used?: Json | null
          feedback_notes?: string | null
          feedback_provided_at?: string | null
          id?: string
          model_version?: string | null
          predicted_failure_type?: string | null
          prediction_horizon_days?: number | null
          recommended_action?: string | null
          risk_factors?: string[] | null
          updated_at?: string | null
          urgency_level?: string | null
          vehicle_id: string
        }
        Update: {
          actual_failure_occurred?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          estimated_roi?: number | null
          failure_probability?: number
          features_used?: Json | null
          feedback_notes?: string | null
          feedback_provided_at?: string | null
          id?: string
          model_version?: string | null
          predicted_failure_type?: string | null
          prediction_horizon_days?: number | null
          recommended_action?: string | null
          risk_factors?: string[] | null
          updated_at?: string | null
          urgency_level?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "ai_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "ai_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          company_id: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string
          resolved_at: string | null
          severity: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          resolved_at?: string | null
          severity: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          resolved_at?: string | null
          severity?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      api_keys: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          key: string
          last_used_at: string | null
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          last_used_at?: string | null
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          last_used_at?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          fleet_size: number | null
          id: string
          industry: string | null
          logo_url: string | null
          max_drivers: number
          max_vehicles: number
          monthly_report_day: number | null
          monthly_report_enabled: boolean | null
          monthly_report_recipients: string | null
          name: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_started_at: string | null
          phone: string | null
          postal_code: string | null
          siret: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string
          subscription_status: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          fleet_size?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          max_drivers?: number
          max_vehicles?: number
          monthly_report_day?: number | null
          monthly_report_enabled?: boolean | null
          monthly_report_recipients?: string | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          phone?: string | null
          postal_code?: string | null
          siret: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          fleet_size?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          max_drivers?: number
          max_vehicles?: number
          monthly_report_day?: number | null
          monthly_report_enabled?: boolean | null
          monthly_report_recipients?: string | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          phone?: string | null
          postal_code?: string | null
          siret?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_activities: {
        Row: {
          activity: Database["public"]["Enums"]["transport_activity"]
          company_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          activity?: Database["public"]["Enums"]["transport_activity"]
          company_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          activity?: Database["public"]["Enums"]["transport_activity"]
          company_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      compliance_rules: {
        Row: {
          activity: Database["public"]["Enums"]["transport_activity"]
          applicable_vehicle_types: string[] | null
          created_at: string | null
          document_code: string
          document_name: string
          equipment_list: string[] | null
          frequency_months: number
          id: string
          is_mandatory: boolean | null
          reminder_days: number | null
          requires_equipment: boolean | null
        }
        Insert: {
          activity: Database["public"]["Enums"]["transport_activity"]
          applicable_vehicle_types?: string[] | null
          created_at?: string | null
          document_code: string
          document_name: string
          equipment_list?: string[] | null
          frequency_months: number
          id?: string
          is_mandatory?: boolean | null
          reminder_days?: number | null
          requires_equipment?: boolean | null
        }
        Update: {
          activity?: Database["public"]["Enums"]["transport_activity"]
          applicable_vehicle_types?: string[] | null
          created_at?: string | null
          document_code?: string
          document_name?: string
          equipment_list?: string[] | null
          frequency_months?: number
          id?: string
          is_mandatory?: boolean | null
          reminder_days?: number | null
          requires_equipment?: boolean | null
        }
        Relationships: []
      }
      cron_state: {
        Row: {
          id: number
          job_name: string
          last_processed_id: string | null
          metadata: Json | null
          processed_count: number | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          job_name: string
          last_processed_id?: string | null
          metadata?: Json | null
          processed_count?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          job_name?: string
          last_processed_id?: string | null
          metadata?: Json | null
          processed_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      document_alert_logs: {
        Row: {
          alert_level: string
          company_id: string
          document_type: string
          expiry_date: string
          id: string
          sent_at: string
          vehicle_id: string
        }
        Insert: {
          alert_level: string
          company_id: string
          document_type: string
          expiry_date: string
          id?: string
          sent_at?: string
          vehicle_id: string
        }
        Update: {
          alert_level?: string
          company_id?: string
          document_type?: string
          expiry_date?: string
          id?: string
          sent_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_alert_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_alert_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "document_alert_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "document_alert_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_alert_logs: {
        Row: {
          alert_level: string
          company_id: string
          document_type: string
          driver_id: string
          expiry_date: string
          id: string
          sent_at: string
        }
        Insert: {
          alert_level: string
          company_id: string
          document_type: string
          driver_id: string
          expiry_date: string
          id?: string
          sent_at?: string
        }
        Update: {
          alert_level?: string
          company_id?: string
          document_type?: string
          driver_id?: string
          expiry_date?: string
          id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_alert_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_checklists: {
        Row: {
          checklist_type: string
          company_id: string
          completed_at: string | null
          created_at: string | null
          driver_id: string
          id: string
          items: Json
          notes: string | null
          status: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          checklist_type?: string
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          driver_id: string
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          checklist_type?: string
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          driver_id?: string
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "driver_checklists_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_checklists_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_checklists_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "driver_checklists_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "driver_checklists_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          company_id: string
          created_at: string
          document_name: string
          document_type: string
          driver_id: string
          expiry_date: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          side: string | null
          storage_path: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          document_name: string
          document_type: string
          driver_id: string
          expiry_date?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          side?: string | null
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          document_name?: string
          document_type?: string
          driver_id?: string
          expiry_date?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          side?: string | null
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          address: string | null
          adr_certificate_expiry: string | null
          adr_classes: string[] | null
          app_access_enabled_at: string | null
          app_access_enabled_by: string | null
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          company_id: string
          contract_type: string | null
          cqc_card_number: string | null
          cqc_category: string | null
          cqc_expiry_date: string | null
          created_at: string | null
          current_vehicle_id: string | null
          driver_card_expiry: string | null
          driver_card_number: string | null
          email: string
          fcos_expiry: string | null
          fimo_date: string | null
          fimo_expiry: string | null
          first_name: string
          fuel_efficiency_score: number | null
          has_app_access: boolean | null
          hire_date: string | null
          id: string
          is_active: boolean
          last_name: string
          license_expiry: string | null
          license_number: string | null
          license_type: string | null
          medical_certificate_expiry: string | null
          nationality: string | null
          phone: string | null
          postal_code: string | null
          qi_date: string | null
          safety_score: number | null
          social_security_number: string | null
          status: string
          termination_date: string | null
          total_distance_driven: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          adr_certificate_expiry?: string | null
          adr_classes?: string[] | null
          app_access_enabled_at?: string | null
          app_access_enabled_by?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          company_id: string
          contract_type?: string | null
          cqc_card_number?: string | null
          cqc_category?: string | null
          cqc_expiry_date?: string | null
          created_at?: string | null
          current_vehicle_id?: string | null
          driver_card_expiry?: string | null
          driver_card_number?: string | null
          email: string
          fcos_expiry?: string | null
          fimo_date?: string | null
          fimo_expiry?: string | null
          first_name: string
          fuel_efficiency_score?: number | null
          has_app_access?: boolean | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          last_name: string
          license_expiry?: string | null
          license_number?: string | null
          license_type?: string | null
          medical_certificate_expiry?: string | null
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          qi_date?: string | null
          safety_score?: number | null
          social_security_number?: string | null
          status?: string
          termination_date?: string | null
          total_distance_driven?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          adr_certificate_expiry?: string | null
          adr_classes?: string[] | null
          app_access_enabled_at?: string | null
          app_access_enabled_by?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          company_id?: string
          contract_type?: string | null
          cqc_card_number?: string | null
          cqc_category?: string | null
          cqc_expiry_date?: string | null
          created_at?: string | null
          current_vehicle_id?: string | null
          driver_card_expiry?: string | null
          driver_card_number?: string | null
          email?: string
          fcos_expiry?: string | null
          fimo_date?: string | null
          fimo_expiry?: string | null
          first_name?: string
          fuel_efficiency_score?: number | null
          has_app_access?: boolean | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          license_expiry?: string | null
          license_number?: string | null
          license_type?: string | null
          medical_certificate_expiry?: string | null
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          qi_date?: string | null
          safety_score?: number | null
          social_security_number?: string | null
          status?: string
          termination_date?: string | null
          total_distance_driven?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fk_current_vehicle"
            columns: ["current_vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_current_vehicle"
            columns: ["current_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "fk_current_vehicle"
            columns: ["current_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "fk_current_vehicle"
            columns: ["current_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_records: {
        Row: {
          company_id: string | null
          consumption_l_per_100km: number | null
          created_at: string | null
          date: string
          driver_id: string | null
          driver_name: string | null
          fuel_type: string | null
          id: string
          mileage_at_fill: number | null
          notes: string | null
          price_per_liter: number | null
          price_total: number | null
          quantity_liters: number
          station_name: string | null
          vehicle_id: string
        }
        Insert: {
          company_id?: string | null
          consumption_l_per_100km?: number | null
          created_at?: string | null
          date?: string
          driver_id?: string | null
          driver_name?: string | null
          fuel_type?: string | null
          id?: string
          mileage_at_fill?: number | null
          notes?: string | null
          price_per_liter?: number | null
          price_total?: number | null
          quantity_liters: number
          station_name?: string | null
          vehicle_id: string
        }
        Update: {
          company_id?: string | null
          consumption_l_per_100km?: number | null
          created_at?: string | null
          date?: string
          driver_id?: string | null
          driver_name?: string | null
          fuel_type?: string | null
          id?: string
          mileage_at_fill?: number | null
          notes?: string | null
          price_per_liter?: number | null
          price_total?: number | null
          quantity_liters?: number
          station_name?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "fuel_records_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "fuel_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "fuel_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_documents: {
        Row: {
          created_at: string
          document_type: string | null
          file_name: string | null
          id: string
          incident_id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          file_name?: string | null
          id?: string
          incident_id: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string | null
          file_name?: string | null
          id?: string
          incident_id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_documents_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          circumstances: string | null
          claim_date: string | null
          claim_number: string | null
          claim_status: string | null
          company_id: string
          created_at: string
          driver_id: string | null
          estimated_damage: number | null
          final_settlement: number | null
          id: string
          incident_date: string
          incident_number: string | null
          incident_type: string
          injuries_description: string | null
          insurance_company: string | null
          insurance_policy_number: string | null
          location_description: string | null
          maintenance_record_id: string | null
          notes: string | null
          reported_by: string | null
          severity: string | null
          status: string
          third_party_info: Json | null
          third_party_involved: boolean | null
          updated_at: string
          vehicle_id: string
          witnesses: Json | null
        }
        Insert: {
          circumstances?: string | null
          claim_date?: string | null
          claim_number?: string | null
          claim_status?: string | null
          company_id: string
          created_at?: string
          driver_id?: string | null
          estimated_damage?: number | null
          final_settlement?: number | null
          id?: string
          incident_date: string
          incident_number?: string | null
          incident_type: string
          injuries_description?: string | null
          insurance_company?: string | null
          insurance_policy_number?: string | null
          location_description?: string | null
          maintenance_record_id?: string | null
          notes?: string | null
          reported_by?: string | null
          severity?: string | null
          status?: string
          third_party_info?: Json | null
          third_party_involved?: boolean | null
          updated_at?: string
          vehicle_id: string
          witnesses?: Json | null
        }
        Update: {
          circumstances?: string | null
          claim_date?: string | null
          claim_number?: string | null
          claim_status?: string | null
          company_id?: string
          created_at?: string
          driver_id?: string | null
          estimated_damage?: number | null
          final_settlement?: number | null
          id?: string
          incident_date?: string
          incident_number?: string | null
          incident_type?: string
          injuries_description?: string | null
          insurance_company?: string | null
          insurance_policy_number?: string | null
          location_description?: string | null
          maintenance_record_id?: string | null
          notes?: string | null
          reported_by?: string | null
          severity?: string | null
          status?: string
          third_party_info?: Json | null
          third_party_involved?: boolean | null
          updated_at?: string
          vehicle_id?: string
          witnesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_maintenance_record_id_fkey"
            columns: ["maintenance_record_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_agenda: {
        Row: {
          attendees: string[] | null
          company_id: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string | null
          id: string
          maintenance_id: string | null
          reminder_sent: boolean | null
          start_time: string
          status: string | null
          title: string
        }
        Insert: {
          attendees?: string[] | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          maintenance_id?: string | null
          reminder_sent?: boolean | null
          start_time: string
          status?: string | null
          title: string
        }
        Update: {
          attendees?: string[] | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          maintenance_id?: string | null
          reminder_sent?: boolean | null
          start_time?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_agenda_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_agenda_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "maintenance_agenda_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_predictions: {
        Row: {
          alert_acknowledged_at: string | null
          alert_sent_at: string | null
          calculated_at: string | null
          company_id: string
          current_km: number
          days_until_due: number | null
          estimated_due_date: string | null
          estimated_due_km: number | null
          id: string
          initialization_note: string | null
          is_initialized: boolean | null
          km_until_due: number | null
          last_maintenance_date: string | null
          last_maintenance_id: string | null
          last_maintenance_km: number | null
          needs_recalculation: boolean | null
          priority: string
          rule_id: string
          status: string
          vehicle_id: string
        }
        Insert: {
          alert_acknowledged_at?: string | null
          alert_sent_at?: string | null
          calculated_at?: string | null
          company_id: string
          current_km: number
          days_until_due?: number | null
          estimated_due_date?: string | null
          estimated_due_km?: number | null
          id?: string
          initialization_note?: string | null
          is_initialized?: boolean | null
          km_until_due?: number | null
          last_maintenance_date?: string | null
          last_maintenance_id?: string | null
          last_maintenance_km?: number | null
          needs_recalculation?: boolean | null
          priority: string
          rule_id: string
          status: string
          vehicle_id: string
        }
        Update: {
          alert_acknowledged_at?: string | null
          alert_sent_at?: string | null
          calculated_at?: string | null
          company_id?: string
          current_km?: number
          days_until_due?: number | null
          estimated_due_date?: string | null
          estimated_due_km?: number | null
          id?: string
          initialization_note?: string | null
          is_initialized?: boolean | null
          km_until_due?: number | null
          last_maintenance_date?: string | null
          last_maintenance_id?: string | null
          last_maintenance_km?: number | null
          needs_recalculation?: boolean | null
          priority?: string
          rule_id?: string
          status?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_predictions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_predictions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "maintenance_predictions_last_maintenance_id_fkey"
            columns: ["last_maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_predictions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "maintenance_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "maintenance_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "maintenance_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          company_id: string
          completed_at: string | null
          completed_date: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          estimated_days: number | null
          estimated_hours: number | null
          final_cost: number | null
          garage_address: string | null
          garage_name: string | null
          garage_phone: string | null
          id: string
          invoice_document_url: string | null
          invoice_number: string | null
          mileage_at_maintenance: number | null
          notes_completion: string | null
          notes_request: string | null
          notes_validation: string | null
          priority: string | null
          provider: string | null
          quote_document_url: string | null
          rdv_confirmed_at: string | null
          rdv_date: string | null
          rdv_scheduled_at: string | null
          rdv_time: string | null
          rdv_token: string | null
          requested_at: string | null
          requested_by: string | null
          scheduled_date: string | null
          status: string
          technician_notes: string | null
          type: string
          updated_at: string | null
          validated_at: string | null
          validation_token: string | null
          vehicle_id: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_days?: number | null
          estimated_hours?: number | null
          final_cost?: number | null
          garage_address?: string | null
          garage_name?: string | null
          garage_phone?: string | null
          id?: string
          invoice_document_url?: string | null
          invoice_number?: string | null
          mileage_at_maintenance?: number | null
          notes_completion?: string | null
          notes_request?: string | null
          notes_validation?: string | null
          priority?: string | null
          provider?: string | null
          quote_document_url?: string | null
          rdv_confirmed_at?: string | null
          rdv_date?: string | null
          rdv_scheduled_at?: string | null
          rdv_time?: string | null
          rdv_token?: string | null
          requested_at?: string | null
          requested_by?: string | null
          scheduled_date?: string | null
          status?: string
          technician_notes?: string | null
          type: string
          updated_at?: string | null
          validated_at?: string | null
          validation_token?: string | null
          vehicle_id: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_days?: number | null
          estimated_hours?: number | null
          final_cost?: number | null
          garage_address?: string | null
          garage_name?: string | null
          garage_phone?: string | null
          id?: string
          invoice_document_url?: string | null
          invoice_number?: string | null
          mileage_at_maintenance?: number | null
          notes_completion?: string | null
          notes_request?: string | null
          notes_validation?: string | null
          priority?: string | null
          provider?: string | null
          quote_document_url?: string | null
          rdv_confirmed_at?: string | null
          rdv_date?: string | null
          rdv_scheduled_at?: string | null
          rdv_time?: string | null
          rdv_token?: string | null
          requested_at?: string | null
          requested_by?: string | null
          scheduled_date?: string | null
          status?: string
          technician_notes?: string | null
          type?: string
          updated_at?: string | null
          validated_at?: string | null
          validation_token?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "maintenance_records_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_reminders: {
        Row: {
          company_id: string | null
          error_message: string | null
          id: string
          maintenance_record_id: string | null
          recipient_email: string
          recipient_role: string | null
          reminder_type: string
          sent_at: string
          status: string
        }
        Insert: {
          company_id?: string | null
          error_message?: string | null
          id?: string
          maintenance_record_id?: string | null
          recipient_email: string
          recipient_role?: string | null
          reminder_type?: string
          sent_at?: string
          status?: string
        }
        Update: {
          company_id?: string | null
          error_message?: string | null
          id?: string
          maintenance_record_id?: string | null
          recipient_email?: string
          recipient_role?: string | null
          reminder_type?: string
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_reminders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_reminders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "maintenance_reminders_maintenance_record_id_fkey"
            columns: ["maintenance_record_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_rules: {
        Row: {
          alert_days_before: number | null
          alert_km_before: number | null
          applicable_fuel_types: string[] | null
          applicable_vehicle_types: string[] | null
          category: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          interval_km: number | null
          interval_months: number | null
          is_active: boolean | null
          is_system_rule: boolean | null
          name: string
          priority: string | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          alert_days_before?: number | null
          alert_km_before?: number | null
          applicable_fuel_types?: string[] | null
          applicable_vehicle_types?: string[] | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          is_active?: boolean | null
          is_system_rule?: boolean | null
          name: string
          priority?: string | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          alert_days_before?: number | null
          alert_km_before?: number | null
          applicable_fuel_types?: string[] | null
          applicable_vehicle_types?: string[] | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          is_active?: boolean | null
          is_system_rule?: boolean | null
          name?: string
          priority?: string | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      maintenance_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          maintenance_id: string | null
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          maintenance_id?: string | null
          new_status: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          maintenance_id?: string | null
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_status_history_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
        ]
      }
      model_training_history: {
        Row: {
          accuracy: number | null
          auc_roc: number | null
          created_at: string | null
          f1_score: number | null
          features_count: number | null
          hyperparameters: Json | null
          id: string
          model_version: string
          precision_score: number | null
          recall: number | null
          training_date: string | null
          training_samples_count: number | null
        }
        Insert: {
          accuracy?: number | null
          auc_roc?: number | null
          created_at?: string | null
          f1_score?: number | null
          features_count?: number | null
          hyperparameters?: Json | null
          id?: string
          model_version: string
          precision_score?: number | null
          recall?: number | null
          training_date?: string | null
          training_samples_count?: number | null
        }
        Update: {
          accuracy?: number | null
          auc_roc?: number | null
          created_at?: string | null
          f1_score?: number | null
          features_count?: number | null
          hyperparameters?: Json | null
          id?: string
          model_version?: string
          precision_score?: number | null
          recall?: number | null
          training_date?: string | null
          training_samples_count?: number | null
        }
        Relationships: []
      }
      monthly_report_logs: {
        Row: {
          company_id: string
          created_at: string | null
          error_message: string | null
          id: string
          period: string
          recipient_count: number
          sent_at: string | null
          status: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          period: string
          recipient_count?: number
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          period?: string
          recipient_count?: number
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_report_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_report_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      monthly_report_unsubscribes: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          unsubscribed_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          unsubscribed_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_report_unsubscribes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_report_unsubscribes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          alert_critical_email: boolean | null
          alert_critical_in_app: boolean | null
          alert_critical_push: boolean | null
          alert_warning_email: boolean | null
          alert_warning_in_app: boolean | null
          alert_warning_push: boolean | null
          company_id: string | null
          created_at: string | null
          document_expiring_email: boolean | null
          document_expiring_in_app: boolean | null
          document_expiring_push: boolean | null
          email_count_24h: number | null
          email_enabled: boolean | null
          fcm_token: string | null
          fcm_token_updated_at: string | null
          fuel_anomaly_email: boolean | null
          fuel_anomaly_in_app: boolean | null
          fuel_anomaly_push: boolean | null
          geofencing_email: boolean | null
          geofencing_in_app: boolean | null
          geofencing_push: boolean | null
          in_app_enabled: boolean | null
          last_email_sent_at: string | null
          maintenance_due_email: boolean | null
          maintenance_due_in_app: boolean | null
          maintenance_due_push: boolean | null
          push_enabled: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_critical_email?: boolean | null
          alert_critical_in_app?: boolean | null
          alert_critical_push?: boolean | null
          alert_warning_email?: boolean | null
          alert_warning_in_app?: boolean | null
          alert_warning_push?: boolean | null
          company_id?: string | null
          created_at?: string | null
          document_expiring_email?: boolean | null
          document_expiring_in_app?: boolean | null
          document_expiring_push?: boolean | null
          email_count_24h?: number | null
          email_enabled?: boolean | null
          fcm_token?: string | null
          fcm_token_updated_at?: string | null
          fuel_anomaly_email?: boolean | null
          fuel_anomaly_in_app?: boolean | null
          fuel_anomaly_push?: boolean | null
          geofencing_email?: boolean | null
          geofencing_in_app?: boolean | null
          geofencing_push?: boolean | null
          in_app_enabled?: boolean | null
          last_email_sent_at?: string | null
          maintenance_due_email?: boolean | null
          maintenance_due_in_app?: boolean | null
          maintenance_due_push?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_critical_email?: boolean | null
          alert_critical_in_app?: boolean | null
          alert_critical_push?: boolean | null
          alert_warning_email?: boolean | null
          alert_warning_in_app?: boolean | null
          alert_warning_push?: boolean | null
          company_id?: string | null
          created_at?: string | null
          document_expiring_email?: boolean | null
          document_expiring_in_app?: boolean | null
          document_expiring_push?: boolean | null
          email_count_24h?: number | null
          email_enabled?: boolean | null
          fcm_token?: string | null
          fcm_token_updated_at?: string | null
          fuel_anomaly_email?: boolean | null
          fuel_anomaly_in_app?: boolean | null
          fuel_anomaly_push?: boolean | null
          geofencing_email?: boolean | null
          geofencing_in_app?: boolean | null
          geofencing_push?: boolean | null
          in_app_enabled?: boolean | null
          last_email_sent_at?: string | null
          maintenance_due_email?: boolean | null
          maintenance_due_in_app?: boolean | null
          maintenance_due_push?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          link: string | null
          message: string
          priority: string | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          link?: string | null
          message: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          link?: string | null
          message?: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_registrations: {
        Row: {
          company_name: string
          created_at: string | null
          email: string
          expires_at: string
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          password_hash: string
          phone: string | null
          setup_token: string
          siret: string | null
          used: boolean | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          email: string
          expires_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          password_hash: string
          phone?: string | null
          setup_token?: string
          siret?: string | null
          used?: boolean | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          password_hash?: string
          phone?: string | null
          setup_token?: string
          siret?: string | null
          used?: boolean | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      predictive_alerts: {
        Row: {
          anomaly_details: string | null
          calculated_at: string
          company_id: string
          component_concerned: string
          control_result: string | null
          controlled_at: string | null
          controlled_by: string | null
          created_at: string | null
          current_score: number
          days_until_critical: number
          degradation_speed: number
          false_positive_count: number | null
          generated_maintenance_id: string | null
          id: string
          linked_inspection_id: string | null
          new_score_after_control: number | null
          predicted_control_date: string
          previous_score: number
          reasoning: string
          status: string
          updated_at: string | null
          urgency_level: string
          urgency_score: number
          vehicle_id: string
        }
        Insert: {
          anomaly_details?: string | null
          calculated_at?: string
          company_id: string
          component_concerned: string
          control_result?: string | null
          controlled_at?: string | null
          controlled_by?: string | null
          created_at?: string | null
          current_score: number
          days_until_critical: number
          degradation_speed: number
          false_positive_count?: number | null
          generated_maintenance_id?: string | null
          id?: string
          linked_inspection_id?: string | null
          new_score_after_control?: number | null
          predicted_control_date: string
          previous_score: number
          reasoning: string
          status?: string
          updated_at?: string | null
          urgency_level: string
          urgency_score: number
          vehicle_id: string
        }
        Update: {
          anomaly_details?: string | null
          calculated_at?: string
          company_id?: string
          component_concerned?: string
          control_result?: string | null
          controlled_at?: string | null
          controlled_by?: string | null
          created_at?: string | null
          current_score?: number
          days_until_critical?: number
          degradation_speed?: number
          false_positive_count?: number | null
          generated_maintenance_id?: string | null
          id?: string
          linked_inspection_id?: string | null
          new_score_after_control?: number | null
          predicted_control_date?: string
          previous_score?: number
          reasoning?: string
          status?: string
          updated_at?: string | null
          urgency_level?: string
          urgency_score?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictive_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "predictive_alerts_controlled_by_fkey"
            columns: ["controlled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictive_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "predictive_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "predictive_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          email: string | null
          email_notifications: boolean | null
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          job_title: string | null
          last_login: string | null
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          job_title?: string | null
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_emails_log: {
        Row: {
          id: string
          rental_id: string | null
          resend_message_id: string | null
          sent_at: string
          sent_to: string
          status: string
          type: string
        }
        Insert: {
          id?: string
          rental_id?: string | null
          resend_message_id?: string | null
          sent_at?: string
          sent_to: string
          status?: string
          type: string
        }
        Update: {
          id?: string
          rental_id?: string | null
          resend_message_id?: string | null
          sent_at?: string
          sent_to?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_emails_log_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_options: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          price_type: string
          sort_order: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          price_type: string
          sort_order?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          price_type?: string
          sort_order?: number
        }
        Relationships: []
      }
      rental_vehicle_photos: {
        Row: {
          created_at: string
          height: number | null
          id: string
          is_primary: boolean
          rental_vehicle_id: string
          size_bytes: number | null
          sort_order: number
          storage_path: string
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          rental_vehicle_id: string
          size_bytes?: number | null
          sort_order?: number
          storage_path: string
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          rental_vehicle_id?: string
          size_bytes?: number | null
          sort_order?: number
          storage_path?: string
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_vehicle_photos_rental_vehicle_id_fkey"
            columns: ["rental_vehicle_id"]
            isOneToOne: false
            referencedRelation: "rental_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_vehicle_photos_rental_vehicle_id_fkey"
            columns: ["rental_vehicle_id"]
            isOneToOne: false
            referencedRelation: "rental_vehicles_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_vehicles: {
        Row: {
          body: string | null
          brand: string
          color: string | null
          cover_photo: string | null
          created_at: string
          created_by: string | null
          deposit_amount: number
          deposit_percentage: number
          description_en: string | null
          description_fr: string | null
          doors: number | null
          extra_km_price: number
          fuel: string | null
          holiday_surcharge: number
          id: string
          included_km_per_day: number
          mileage: number | null
          model: string
          photos: Json
          power_hp: number | null
          price_per_day: number
          price_per_hour: number | null
          pricing_tiers: Json
          seats: number | null
          slug: string
          status: string
          transmission: string | null
          updated_at: string
          vehicle_type: string | null
          version: string | null
          weekend_surcharge: number
          year: number | null
        }
        Insert: {
          body?: string | null
          brand: string
          color?: string | null
          cover_photo?: string | null
          created_at?: string
          created_by?: string | null
          deposit_amount?: number
          deposit_percentage?: number
          description_en?: string | null
          description_fr?: string | null
          doors?: number | null
          extra_km_price?: number
          fuel?: string | null
          holiday_surcharge?: number
          id?: string
          included_km_per_day?: number
          mileage?: number | null
          model: string
          photos?: Json
          power_hp?: number | null
          price_per_day: number
          price_per_hour?: number | null
          pricing_tiers?: Json
          seats?: number | null
          slug: string
          status?: string
          transmission?: string | null
          updated_at?: string
          vehicle_type?: string | null
          version?: string | null
          weekend_surcharge?: number
          year?: number | null
        }
        Update: {
          body?: string | null
          brand?: string
          color?: string | null
          cover_photo?: string | null
          created_at?: string
          created_by?: string | null
          deposit_amount?: number
          deposit_percentage?: number
          description_en?: string | null
          description_fr?: string | null
          doors?: number | null
          extra_km_price?: number
          fuel?: string | null
          holiday_surcharge?: number
          id?: string
          included_km_per_day?: number
          mileage?: number | null
          model?: string
          photos?: Json
          power_hp?: number | null
          price_per_day?: number
          price_per_hour?: number | null
          pricing_tiers?: Json
          seats?: number | null
          slug?: string
          status?: string
          transmission?: string | null
          updated_at?: string
          vehicle_type?: string | null
          version?: string | null
          weekend_surcharge?: number
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_vehicles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          base_price_per_day: number
          business_name: string | null
          business_siret: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cgv_accepted: boolean
          cgv_accepted_at: string | null
          client_address: string | null
          client_birth_date: string | null
          client_city: string | null
          client_email: string
          client_first_name: string
          client_last_name: string
          client_license_number: string | null
          client_phone: string
          client_postal_code: string | null
          contract_generated_at: string | null
          contract_url: string | null
          created_at: string
          deposit_amount: number
          deposit_paid: boolean
          deposit_paid_at: string | null
          end_date: string
          id: string
          internal_notes: string | null
          is_business: boolean
          managed_by: string | null
          options_total: number
          pickup_time: string
          reference: string
          rental_vehicle_id: string
          return_time: string
          selected_options: Json
          start_date: string
          status: string
          stripe_checkout_expires_at: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          surcharge_total: number
          total_amount: number
          total_days: number
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          base_price_per_day: number
          business_name?: string | null
          business_siret?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cgv_accepted?: boolean
          cgv_accepted_at?: string | null
          client_address?: string | null
          client_birth_date?: string | null
          client_city?: string | null
          client_email: string
          client_first_name: string
          client_last_name: string
          client_license_number?: string | null
          client_phone: string
          client_postal_code?: string | null
          contract_generated_at?: string | null
          contract_url?: string | null
          created_at?: string
          deposit_amount: number
          deposit_paid?: boolean
          deposit_paid_at?: string | null
          end_date: string
          id?: string
          internal_notes?: string | null
          is_business?: boolean
          managed_by?: string | null
          options_total?: number
          pickup_time?: string
          reference?: string
          rental_vehicle_id: string
          return_time?: string
          selected_options?: Json
          start_date: string
          status?: string
          stripe_checkout_expires_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal: number
          surcharge_total?: number
          total_amount: number
          total_days: number
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          base_price_per_day?: number
          business_name?: string | null
          business_siret?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cgv_accepted?: boolean
          cgv_accepted_at?: string | null
          client_address?: string | null
          client_birth_date?: string | null
          client_city?: string | null
          client_email?: string
          client_first_name?: string
          client_last_name?: string
          client_license_number?: string | null
          client_phone?: string
          client_postal_code?: string | null
          contract_generated_at?: string | null
          contract_url?: string | null
          created_at?: string
          deposit_amount?: number
          deposit_paid?: boolean
          deposit_paid_at?: string | null
          end_date?: string
          id?: string
          internal_notes?: string | null
          is_business?: boolean
          managed_by?: string | null
          options_total?: number
          pickup_time?: string
          reference?: string
          rental_vehicle_id?: string
          return_time?: string
          selected_options?: Json
          start_date?: string
          status?: string
          stripe_checkout_expires_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          surcharge_total?: number
          total_amount?: number
          total_days?: number
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_managed_by_fkey"
            columns: ["managed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_rental_vehicle_id_fkey"
            columns: ["rental_vehicle_id"]
            isOneToOne: false
            referencedRelation: "rental_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_rental_vehicle_id_fkey"
            columns: ["rental_vehicle_id"]
            isOneToOne: false
            referencedRelation: "rental_vehicles_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          address: string
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          order_index: number
          priority: number | null
          route_id: string
          service_duration: number | null
          time_window_end: string | null
          time_window_start: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          order_index: number
          priority?: number | null
          route_id: string
          service_duration?: number | null
          time_window_end?: string | null
          time_window_start?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          order_index?: number
          priority?: number | null
          route_id?: string
          service_duration?: number | null
          time_window_end?: string | null
          time_window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          company_id: string
          created_at: string | null
          driver_id: string | null
          estimated_duration: number | null
          fuel_cost: number | null
          id: string
          name: string
          notes: string | null
          route_date: string
          status: string | null
          total_distance: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          driver_id?: string | null
          estimated_duration?: number | null
          fuel_cost?: number | null
          id?: string
          name: string
          notes?: string | null
          route_date: string
          status?: string | null
          total_distance?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          driver_id?: string | null
          estimated_duration?: number | null
          fuel_cost?: number | null
          id?: string
          name?: string
          notes?: string | null
          route_date?: string
          status?: string | null
          total_distance?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "routes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      sos_emergency_contracts: {
        Row: {
          contract_ref: string | null
          created_at: string | null
          for_distance: string | null
          for_immobilized: boolean | null
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          phone_number: string
          priority: number | null
          service_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contract_ref?: string | null
          created_at?: string | null
          for_distance?: string | null
          for_immobilized?: boolean | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          phone_number: string
          priority?: number | null
          service_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contract_ref?: string | null
          created_at?: string | null
          for_distance?: string | null
          for_immobilized?: boolean | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          phone_number?: string
          priority?: number | null
          service_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sos_history: {
        Row: {
          breakdown_type: string
          created_at: string | null
          distance_category: string
          id: string
          location_text: string | null
          solution_name: string | null
          solution_phone: string | null
          solution_type: string
          user_id: string
          vehicle_id: string | null
          vehicle_state: string
        }
        Insert: {
          breakdown_type: string
          created_at?: string | null
          distance_category: string
          id?: string
          location_text?: string | null
          solution_name?: string | null
          solution_phone?: string | null
          solution_type: string
          user_id: string
          vehicle_id?: string | null
          vehicle_state: string
        }
        Update: {
          breakdown_type?: string
          created_at?: string | null
          distance_category?: string
          id?: string
          location_text?: string | null
          solution_name?: string | null
          solution_phone?: string | null
          solution_type?: string
          user_id?: string
          vehicle_id?: string | null
          vehicle_state?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "sos_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "sos_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_providers: {
        Row: {
          address: string | null
          city: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_distance_km: number | null
          name: string
          phone_24h: string | null
          phone_standard: string | null
          priority: number | null
          specialty: string
          updated_at: string | null
          user_id: string
          vehicle_brands: string[] | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_distance_km?: number | null
          name: string
          phone_24h?: string | null
          phone_standard?: string | null
          priority?: number | null
          specialty?: string
          updated_at?: string | null
          user_id: string
          vehicle_brands?: string[] | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_distance_km?: number | null
          name?: string
          phone_24h?: string | null
          phone_standard?: string | null
          priority?: number | null
          specialty?: string
          updated_at?: string | null
          user_id?: string
          vehicle_brands?: string[] | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          company_id: string
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          features: Json | null
          id: string
          plan: Database["public"]["Enums"]["plan_type"] | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_limit: number | null
          vehicle_limit: number | null
        }
        Insert: {
          canceled_at?: string | null
          company_id: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          features?: Json | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_limit?: number | null
          vehicle_limit?: number | null
        }
        Update: {
          canceled_at?: string | null
          company_id?: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          features?: Json | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_limit?: number | null
          vehicle_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      support_messages: {
        Row: {
          author_id: string | null
          author_type: string
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          author_type?: string
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          author_type?: string
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_notification_queue: {
        Row: {
          content: string | null
          created_at: string | null
          error_message: string | null
          id: string
          recipient_email: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          ticket_id: string
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          ticket_id: string
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          ticket_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_notification_queue_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      tire_depth_checks: {
        Row: {
          check_date: string
          check_km: number
          checked_by: string | null
          company_id: string
          created_at: string | null
          depth_center: number | null
          depth_inner: number | null
          depth_outer: number | null
          id: string
          mounting_id: string
          notes: string | null
          pressure_bar: number | null
          tire_id: string
          tread_depth: number
          vehicle_id: string
        }
        Insert: {
          check_date?: string
          check_km: number
          checked_by?: string | null
          company_id: string
          created_at?: string | null
          depth_center?: number | null
          depth_inner?: number | null
          depth_outer?: number | null
          id?: string
          mounting_id: string
          notes?: string | null
          pressure_bar?: number | null
          tire_id: string
          tread_depth: number
          vehicle_id: string
        }
        Update: {
          check_date?: string
          check_km?: number
          checked_by?: string | null
          company_id?: string
          created_at?: string | null
          depth_center?: number | null
          depth_inner?: number | null
          depth_outer?: number | null
          id?: string
          mounting_id?: string
          notes?: string | null
          pressure_bar?: number | null
          tire_id?: string
          tread_depth?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tire_depth_checks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tire_depth_checks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "tire_depth_checks_mounting_id_fkey"
            columns: ["mounting_id"]
            isOneToOne: false
            referencedRelation: "tire_mountings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tire_depth_checks_tire_id_fkey"
            columns: ["tire_id"]
            isOneToOne: false
            referencedRelation: "tires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tire_depth_checks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tire_depth_checks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "tire_depth_checks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "tire_depth_checks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      tire_mountings: {
        Row: {
          axle_position: string
          company_id: string
          created_at: string | null
          destination: string | null
          garage_name: string | null
          id: string
          mount_type: string
          mounted_date: string
          mounted_km: number
          notes: string | null
          performed_by: string | null
          reason_unmounted: string | null
          tire_id: string
          tread_depth_at_unmount: number | null
          unmounted_date: string | null
          unmounted_km: number | null
          vehicle_id: string
        }
        Insert: {
          axle_position: string
          company_id: string
          created_at?: string | null
          destination?: string | null
          garage_name?: string | null
          id?: string
          mount_type: string
          mounted_date: string
          mounted_km: number
          notes?: string | null
          performed_by?: string | null
          reason_unmounted?: string | null
          tire_id: string
          tread_depth_at_unmount?: number | null
          unmounted_date?: string | null
          unmounted_km?: number | null
          vehicle_id: string
        }
        Update: {
          axle_position?: string
          company_id?: string
          created_at?: string | null
          destination?: string | null
          garage_name?: string | null
          id?: string
          mount_type?: string
          mounted_date?: string
          mounted_km?: number
          notes?: string | null
          performed_by?: string | null
          reason_unmounted?: string | null
          tire_id?: string
          tread_depth_at_unmount?: number | null
          unmounted_date?: string | null
          unmounted_km?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tire_mountings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tire_mountings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "tire_mountings_tire_id_fkey"
            columns: ["tire_id"]
            isOneToOne: false
            referencedRelation: "tires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tire_mountings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tire_mountings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "tire_mountings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "tire_mountings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      tires: {
        Row: {
          brand: string
          company_id: string
          created_at: string | null
          dimensions: string
          dot_code: string | null
          id: string
          invoice_reference: string | null
          is_retreaded: boolean | null
          load_index: string | null
          manufacture_week: number | null
          manufacture_year: number | null
          model: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          retreaded_count: number | null
          retreaded_date: string | null
          serial_number: string | null
          speed_index: string | null
          status: string
          supplier: string | null
          tire_type: string | null
          tread_depth_current: number | null
          tread_depth_measured_at: string | null
          tread_depth_measured_km: number | null
          tread_depth_new: number | null
          updated_at: string | null
        }
        Insert: {
          brand: string
          company_id: string
          created_at?: string | null
          dimensions: string
          dot_code?: string | null
          id?: string
          invoice_reference?: string | null
          is_retreaded?: boolean | null
          load_index?: string | null
          manufacture_week?: number | null
          manufacture_year?: number | null
          model?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          retreaded_count?: number | null
          retreaded_date?: string | null
          serial_number?: string | null
          speed_index?: string | null
          status?: string
          supplier?: string | null
          tire_type?: string | null
          tread_depth_current?: number | null
          tread_depth_measured_at?: string | null
          tread_depth_measured_km?: number | null
          tread_depth_new?: number | null
          updated_at?: string | null
        }
        Update: {
          brand?: string
          company_id?: string
          created_at?: string | null
          dimensions?: string
          dot_code?: string | null
          id?: string
          invoice_reference?: string | null
          is_retreaded?: boolean | null
          load_index?: string | null
          manufacture_week?: number | null
          manufacture_year?: number | null
          model?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          retreaded_count?: number | null
          retreaded_date?: string | null
          serial_number?: string | null
          speed_index?: string | null
          status?: string
          supplier?: string | null
          tire_type?: string | null
          tread_depth_current?: number | null
          tread_depth_measured_at?: string | null
          tread_depth_measured_km?: number | null
          tread_depth_new?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tires_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tires_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      user_appearance_settings: {
        Row: {
          created_at: string | null
          currency: string | null
          custom_color: string | null
          date_format: string | null
          density: string | null
          font: string | null
          font_size: number | null
          glass_effects: boolean | null
          id: string
          language: string | null
          primary_color: string | null
          reduce_motion: boolean | null
          shadows: boolean | null
          sidebar_auto_collapse: boolean | null
          sidebar_icons_only: boolean | null
          sidebar_style: string | null
          theme: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          custom_color?: string | null
          date_format?: string | null
          density?: string | null
          font?: string | null
          font_size?: number | null
          glass_effects?: boolean | null
          id?: string
          language?: string | null
          primary_color?: string | null
          reduce_motion?: boolean | null
          shadows?: boolean | null
          sidebar_auto_collapse?: boolean | null
          sidebar_icons_only?: boolean | null
          sidebar_style?: string | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          custom_color?: string | null
          date_format?: string | null
          density?: string | null
          font?: string | null
          font_size?: number | null
          glass_effects?: boolean | null
          id?: string
          language?: string | null
          primary_color?: string | null
          reduce_motion?: boolean | null
          shadows?: boolean | null
          sidebar_auto_collapse?: boolean | null
          sidebar_icons_only?: boolean | null
          sidebar_style?: string | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_appearance_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          alert_critical_only: boolean | null
          alert_documents_expiry: boolean | null
          alert_fuel: boolean | null
          alert_inspection: boolean | null
          alert_maintenance: boolean | null
          alert_routes: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_critical_only?: boolean | null
          alert_documents_expiry?: boolean | null
          alert_fuel?: boolean | null
          alert_inspection?: boolean | null
          alert_maintenance?: boolean | null
          alert_routes?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_critical_only?: boolean | null
          alert_documents_expiry?: boolean | null
          alert_fuel?: boolean | null
          alert_inspection?: boolean | null
          alert_maintenance?: boolean | null
          alert_routes?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_push_tokens: {
        Row: {
          created_at: string | null
          device_name: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_service_providers: {
        Row: {
          address: string
          city: string
          contact_name: string | null
          contract_number: string | null
          created_at: string | null
          email: string | null
          frigo_brands: string[] | null
          id: string
          intervention_radius_km: number | null
          is_active: boolean | null
          lat: number | null
          lng: number | null
          max_tonnage: number | null
          name: string
          phone: string
          postal_code: string | null
          priority: number | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string
          vehicle_brands: string[] | null
          vehicle_types_supported: string[] | null
        }
        Insert: {
          address: string
          city: string
          contact_name?: string | null
          contract_number?: string | null
          created_at?: string | null
          email?: string | null
          frigo_brands?: string[] | null
          id?: string
          intervention_radius_km?: number | null
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          max_tonnage?: number | null
          name: string
          phone: string
          postal_code?: string | null
          priority?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id: string
          vehicle_brands?: string[] | null
          vehicle_types_supported?: string[] | null
        }
        Update: {
          address?: string
          city?: string
          contact_name?: string | null
          contract_number?: string | null
          created_at?: string | null
          email?: string | null
          frigo_brands?: string[] | null
          id?: string
          intervention_radius_km?: number | null
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          max_tonnage?: number | null
          name?: string
          phone?: string
          postal_code?: string | null
          priority?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string
          vehicle_brands?: string[] | null
          vehicle_types_supported?: string[] | null
        }
        Relationships: []
      }
      vehicle_activity_assignments: {
        Row: {
          activity: Database["public"]["Enums"]["transport_activity"]
          assigned_by: string | null
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          start_date: string
          vehicle_id: string
        }
        Insert: {
          activity: Database["public"]["Enums"]["transport_activity"]
          assigned_by?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          vehicle_id: string
        }
        Update: {
          activity?: Database["public"]["Enums"]["transport_activity"]
          assigned_by?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_activity_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_activity_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_activity_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_activity_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_axle_configs: {
        Row: {
          axle_details: Json
          axle_formula: string
          company_id: string
          created_at: string | null
          id: string
          reference_dimensions: Json | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          axle_details?: Json
          axle_formula: string
          company_id: string
          created_at?: string | null
          id?: string
          reference_dimensions?: Json | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          axle_details?: Json
          axle_formula?: string
          company_id?: string
          created_at?: string | null
          id?: string
          reference_dimensions?: Json | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_axle_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_axle_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "vehicle_axle_configs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_axle_configs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_axle_configs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_axle_configs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_documents: {
        Row: {
          company_id: string
          created_at: string | null
          expiry_date: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          name: string
          reminder_days: number | null
          type: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          expiry_date?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          name: string
          reminder_days?: number | null
          type: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          expiry_date?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          name?: string
          reminder_days?: number | null
          type?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_driver_assignments: {
        Row: {
          assigned_by: string | null
          company_id: string
          created_at: string
          driver_id: string
          end_date: string | null
          id: string
          is_primary: boolean
          notes: string | null
          start_date: string
          vehicle_id: string
        }
        Insert: {
          assigned_by?: string | null
          company_id: string
          created_at?: string
          driver_id: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          start_date?: string
          vehicle_id: string
        }
        Update: {
          assigned_by?: string | null
          company_id?: string
          created_at?: string
          driver_id?: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          start_date?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_driver_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_driver_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "vehicle_driver_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_driver_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_driver_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_driver_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_driver_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          adblue_level: number | null
          cleanliness_cargo_area: number | null
          cleanliness_exterior: number
          cleanliness_interior: number
          company_id: string
          compartment_c1_temp: number | null
          compartment_c2_temp: number | null
          created_at: string
          created_by: string | null
          defects_count: number | null
          driver_name: string
          driver_signature: string | null
          fuel_level: number
          gnr_level: number | null
          grade: string | null
          id: string
          inspection_date: string | null
          inspector_notes: string | null
          location: string | null
          mileage: number
          photos: Json | null
          reported_defects: Json
          score: number | null
          status: string
          tires_condition: Json
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          vehicle_id: string
        }
        Insert: {
          adblue_level?: number | null
          cleanliness_cargo_area?: number | null
          cleanliness_exterior: number
          cleanliness_interior: number
          company_id: string
          compartment_c1_temp?: number | null
          compartment_c2_temp?: number | null
          created_at?: string
          created_by?: string | null
          defects_count?: number | null
          driver_name: string
          driver_signature?: string | null
          fuel_level: number
          gnr_level?: number | null
          grade?: string | null
          id?: string
          inspection_date?: string | null
          inspector_notes?: string | null
          location?: string | null
          mileage: number
          photos?: Json | null
          reported_defects?: Json
          score?: number | null
          status?: string
          tires_condition?: Json
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          vehicle_id: string
        }
        Update: {
          adblue_level?: number | null
          cleanliness_cargo_area?: number | null
          cleanliness_exterior?: number
          cleanliness_interior?: number
          company_id?: string
          compartment_c1_temp?: number | null
          compartment_c2_temp?: number | null
          created_at?: string
          created_by?: string | null
          defects_count?: number | null
          driver_name?: string
          driver_signature?: string | null
          fuel_level?: number
          gnr_level?: number | null
          grade?: string | null
          id?: string
          inspection_date?: string | null
          inspector_notes?: string | null
          location?: string | null
          mileage?: number
          photos?: Json | null
          reported_defects?: Json
          score?: number | null
          status?: string
          tires_condition?: Json
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          vehicle_id?: string
        }
        Relationships: []
      }
      vehicle_predictive_thresholds: {
        Row: {
          adjusted_at: string | null
          adjusted_by: string | null
          adjustment_reason: string | null
          company_id: string
          created_at: string | null
          custom_threshold_score: number | null
          false_positive_count: number | null
          id: string
          sensitivity_multiplier: number | null
          vehicle_id: string
        }
        Insert: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjustment_reason?: string | null
          company_id: string
          created_at?: string | null
          custom_threshold_score?: number | null
          false_positive_count?: number | null
          id?: string
          sensitivity_multiplier?: number | null
          vehicle_id: string
        }
        Update: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjustment_reason?: string | null
          company_id?: string
          created_at?: string | null
          custom_threshold_score?: number | null
          false_positive_count?: number | null
          id?: string
          sensitivity_multiplier?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_predictive_thresholds_adjusted_by_fkey"
            columns: ["adjusted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_predictive_thresholds_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_predictive_thresholds_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "vehicle_predictive_thresholds_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_predictive_thresholds_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_predictive_thresholds_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_predictive_thresholds_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_status_history: {
        Row: {
          changed_at: string
          changed_by: string
          company_id: string
          id: string
          maintenance_record_id: string | null
          new_status: string
          old_status: string
          reason: string | null
          vehicle_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string
          company_id: string
          id?: string
          maintenance_record_id?: string | null
          new_status: string
          old_status: string
          reason?: string | null
          vehicle_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          company_id?: string
          id?: string
          maintenance_record_id?: string | null
          new_status?: string
          old_status?: string
          reason?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_status_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_status_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "vehicle_status_history_maintenance_record_id_fkey"
            columns: ["maintenance_record_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_status_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_status_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_status_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_status_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_telemetry: {
        Row: {
          avg_speed: number | null
          battery_voltage: number | null
          coolant_temp: number | null
          created_at: string | null
          engine_hours: number | null
          fault_codes: Json | null
          harsh_acceleration_count: number | null
          harsh_braking_count: number | null
          id: string
          idle_time_minutes: number | null
          max_speed: number | null
          mileage: number | null
          oil_pressure: number | null
          recorded_at: string | null
          rpm_avg: number | null
          temperature_c: number | null
          vehicle_id: string
          weather_condition: string | null
        }
        Insert: {
          avg_speed?: number | null
          battery_voltage?: number | null
          coolant_temp?: number | null
          created_at?: string | null
          engine_hours?: number | null
          fault_codes?: Json | null
          harsh_acceleration_count?: number | null
          harsh_braking_count?: number | null
          id?: string
          idle_time_minutes?: number | null
          max_speed?: number | null
          mileage?: number | null
          oil_pressure?: number | null
          recorded_at?: string | null
          rpm_avg?: number | null
          temperature_c?: number | null
          vehicle_id: string
          weather_condition?: string | null
        }
        Update: {
          avg_speed?: number | null
          battery_voltage?: number | null
          coolant_temp?: number | null
          created_at?: string | null
          engine_hours?: number | null
          fault_codes?: Json | null
          harsh_acceleration_count?: number | null
          harsh_braking_count?: number | null
          id?: string
          idle_time_minutes?: number | null
          max_speed?: number | null
          mileage?: number | null
          oil_pressure?: number | null
          recorded_at?: string | null
          rpm_avg?: number | null
          temperature_c?: number | null
          vehicle_id?: string
          weather_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_telemetry_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_telemetry_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_telemetry_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "vehicle_telemetry_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          adr_certificate_date: string | null
          adr_certificate_expiry: string | null
          adr_equipment_check_date: string | null
          adr_equipment_expiry: string | null
          assigned_driver_id: string | null
          atp_date: string | null
          atp_expiry: string | null
          brand: string
          color: string | null
          company_id: string
          compatible_activities:
            | Database["public"]["Enums"]["transport_activity"][]
            | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          current_speed: number | null
          dates_auto_calculated: boolean | null
          deleted_at: string | null
          detailed_type: string | null
          fuel_consumption_avg: number | null
          fuel_type: string | null
          id: string
          insurance_company: string | null
          insurance_expiry: string | null
          insurance_policy_number: string | null
          last_maintenance_date: string | null
          last_position_update: string | null
          maintenance_ended_at: string | null
          maintenance_started_at: string | null
          mileage: number | null
          model: string
          next_maintenance_date: string | null
          next_maintenance_mileage: number | null
          purchase_date: string | null
          qr_code_data: string | null
          qr_code_url: string | null
          registration_number: string
          status: string
          tachy_control_date: string | null
          tachy_control_expiry: string | null
          technical_control_date: string | null
          technical_control_expiry: string | null
          type: string
          updated_at: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          adr_certificate_date?: string | null
          adr_certificate_expiry?: string | null
          adr_equipment_check_date?: string | null
          adr_equipment_expiry?: string | null
          assigned_driver_id?: string | null
          atp_date?: string | null
          atp_expiry?: string | null
          brand: string
          color?: string | null
          company_id: string
          compatible_activities?:
            | Database["public"]["Enums"]["transport_activity"][]
            | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_speed?: number | null
          dates_auto_calculated?: boolean | null
          deleted_at?: string | null
          detailed_type?: string | null
          fuel_consumption_avg?: number | null
          fuel_type?: string | null
          id?: string
          insurance_company?: string | null
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          last_maintenance_date?: string | null
          last_position_update?: string | null
          maintenance_ended_at?: string | null
          maintenance_started_at?: string | null
          mileage?: number | null
          model: string
          next_maintenance_date?: string | null
          next_maintenance_mileage?: number | null
          purchase_date?: string | null
          qr_code_data?: string | null
          qr_code_url?: string | null
          registration_number: string
          status?: string
          tachy_control_date?: string | null
          tachy_control_expiry?: string | null
          technical_control_date?: string | null
          technical_control_expiry?: string | null
          type: string
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          adr_certificate_date?: string | null
          adr_certificate_expiry?: string | null
          adr_equipment_check_date?: string | null
          adr_equipment_expiry?: string | null
          assigned_driver_id?: string | null
          atp_date?: string | null
          atp_expiry?: string | null
          brand?: string
          color?: string | null
          company_id?: string
          compatible_activities?:
            | Database["public"]["Enums"]["transport_activity"][]
            | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_speed?: number | null
          dates_auto_calculated?: boolean | null
          deleted_at?: string | null
          detailed_type?: string | null
          fuel_consumption_avg?: number | null
          fuel_type?: string | null
          id?: string
          insurance_company?: string | null
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          last_maintenance_date?: string | null
          last_position_update?: string | null
          maintenance_ended_at?: string | null
          maintenance_started_at?: string | null
          mileage?: number | null
          model?: string
          next_maintenance_date?: string | null
          next_maintenance_mileage?: number | null
          purchase_date?: string | null
          qr_code_data?: string | null
          qr_code_url?: string | null
          registration_number?: string
          status?: string
          tachy_control_date?: string | null
          tachy_control_expiry?: string | null
          technical_control_date?: string | null
          technical_control_expiry?: string | null
          type?: string
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      webhook_errors: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          processed: boolean | null
          stripe_event_id: string | null
          user_email: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          processed?: boolean | null
          stripe_event_id?: string | null
          user_email?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          processed?: boolean | null
          stripe_event_id?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          processing_duration_ms: number | null
          processing_error: string | null
          retry_count: number | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_duration_ms?: number | null
          processing_error?: string | null
          retry_count?: number | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_duration_ms?: number | null
          processing_error?: string | null
          retry_count?: number | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          company_id: string
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          secret: string
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          secret?: string
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          secret?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
    }
    Views: {
      active_vehicles: {
        Row: {
          assigned_driver_id: string | null
          atp_date: string | null
          atp_expiry: string | null
          brand: string | null
          color: string | null
          company_id: string | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          current_speed: number | null
          dates_auto_calculated: boolean | null
          deleted_at: string | null
          fuel_consumption_avg: number | null
          fuel_type: string | null
          id: string | null
          insurance_company: string | null
          insurance_expiry: string | null
          insurance_policy_number: string | null
          last_maintenance_date: string | null
          last_position_update: string | null
          maintenance_ended_at: string | null
          maintenance_started_at: string | null
          mileage: number | null
          model: string | null
          next_maintenance_date: string | null
          next_maintenance_mileage: number | null
          purchase_date: string | null
          qr_code_data: string | null
          qr_code_url: string | null
          registration_number: string | null
          status: string | null
          tachy_control_date: string | null
          tachy_control_expiry: string | null
          technical_control_date: string | null
          technical_control_expiry: string | null
          type: string | null
          updated_at: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          assigned_driver_id?: string | null
          atp_date?: string | null
          atp_expiry?: string | null
          brand?: string | null
          color?: string | null
          company_id?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_speed?: number | null
          dates_auto_calculated?: boolean | null
          deleted_at?: string | null
          fuel_consumption_avg?: number | null
          fuel_type?: string | null
          id?: string | null
          insurance_company?: string | null
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          last_maintenance_date?: string | null
          last_position_update?: string | null
          maintenance_ended_at?: string | null
          maintenance_started_at?: string | null
          mileage?: number | null
          model?: string | null
          next_maintenance_date?: string | null
          next_maintenance_mileage?: number | null
          purchase_date?: string | null
          qr_code_data?: string | null
          qr_code_url?: string | null
          registration_number?: string | null
          status?: string | null
          tachy_control_date?: string | null
          tachy_control_expiry?: string | null
          technical_control_date?: string | null
          technical_control_expiry?: string | null
          type?: string | null
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          assigned_driver_id?: string | null
          atp_date?: string | null
          atp_expiry?: string | null
          brand?: string | null
          color?: string | null
          company_id?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_speed?: number | null
          dates_auto_calculated?: boolean | null
          deleted_at?: string | null
          fuel_consumption_avg?: number | null
          fuel_type?: string | null
          id?: string | null
          insurance_company?: string | null
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          last_maintenance_date?: string | null
          last_position_update?: string | null
          maintenance_ended_at?: string | null
          maintenance_started_at?: string | null
          mileage?: number | null
          model?: string | null
          next_maintenance_date?: string | null
          next_maintenance_mileage?: number | null
          purchase_date?: string | null
          qr_code_data?: string | null
          qr_code_url?: string | null
          registration_number?: string | null
          status?: string | null
          tachy_control_date?: string | null
          tachy_control_expiry?: string | null
          technical_control_date?: string | null
          technical_control_expiry?: string | null
          type?: string | null
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      agenda_with_details: {
        Row: {
          attendees: string[] | null
          company_id: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string | null
          event_type: string | null
          garage_address: string | null
          garage_name: string | null
          garage_phone: string | null
          id: string | null
          maintenance_id: string | null
          maintenance_status: string | null
          maintenance_type: string | null
          priority: string | null
          reminder_sent: boolean | null
          start_time: string | null
          status: string | null
          title: string | null
          vehicle_id: string | null
          vehicle_registration: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_agenda_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_agenda_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "maintenance_agenda_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "active_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_current_activity"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_regulatory_alerts"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscription: {
        Row: {
          can_add_user: boolean | null
          can_add_vehicle: boolean | null
          company_id: string | null
          company_name: string | null
          current_period_end: string | null
          current_user_count: number | null
          current_vehicle_count: number | null
          plan: Database["public"]["Enums"]["plan_type"] | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_limit: number | null
          vehicle_limit: number | null
        }
        Relationships: []
      }
      compliance_rules_summary: {
        Row: {
          activity: Database["public"]["Enums"]["transport_activity"] | null
          documents: string[] | null
          mandatory_rules: number | null
          total_rules: number | null
        }
        Relationships: []
      }
      rental_vehicles_with_stats: {
        Row: {
          active_reservations_count: number | null
          body: string | null
          brand: string | null
          color: string | null
          cover_photo: string | null
          created_at: string | null
          created_by: string | null
          deposit_amount: number | null
          deposit_percentage: number | null
          description_en: string | null
          description_fr: string | null
          doors: number | null
          extra_km_price: number | null
          fuel: string | null
          holiday_surcharge: number | null
          id: string | null
          included_km_per_day: number | null
          mileage: number | null
          model: string | null
          next_available_after: string | null
          photos: Json | null
          power_hp: number | null
          price_per_day: number | null
          price_per_hour: number | null
          pricing_tiers: Json | null
          seats: number | null
          slug: string | null
          status: string | null
          transmission: string | null
          updated_at: string | null
          vehicle_type: string | null
          version: string | null
          weekend_surcharge: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_vehicles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_current_activity: {
        Row: {
          activity_notes: string | null
          activity_start_date: string | null
          company_id: string | null
          current_activity:
            | Database["public"]["Enums"]["transport_activity"]
            | null
          inferred_activities:
            | Database["public"]["Enums"]["transport_activity"][]
            | null
          registration_number: string | null
          vehicle_id: string | null
          vehicle_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
      vehicle_regulatory_alerts: {
        Row: {
          atp_date: string | null
          atp_expiry: string | null
          atp_status: string | null
          brand: string | null
          company_id: string | null
          ct_status: string | null
          model: string | null
          registration_number: string | null
          tachy_control_date: string | null
          tachy_control_expiry: string | null
          tachy_status: string | null
          technical_control_date: string | null
          technical_control_expiry: string | null
          type: string | null
          vehicle_id: string | null
        }
        Insert: {
          atp_date?: string | null
          atp_expiry?: string | null
          atp_status?: never
          brand?: string | null
          company_id?: string | null
          ct_status?: never
          model?: string | null
          registration_number?: string | null
          tachy_control_date?: string | null
          tachy_control_expiry?: string | null
          tachy_status?: never
          technical_control_date?: string | null
          technical_control_expiry?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Update: {
          atp_date?: string | null
          atp_expiry?: string | null
          atp_status?: never
          brand?: string | null
          company_id?: string | null
          ct_status?: never
          model?: string | null
          registration_number?: string | null
          tachy_control_date?: string | null
          tachy_control_expiry?: string | null
          tachy_status?: never
          technical_control_date?: string | null
          technical_control_expiry?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_subscription"
            referencedColumns: ["company_id"]
          },
        ]
      }
    }
    Functions: {
      assign_vehicle_activity_atomic: {
        Args: {
          p_activity: Database["public"]["Enums"]["transport_activity"]
          p_assigned_by: string
          p_notes: string
          p_start_date: string
          p_vehicle_id: string
        }
        Returns: Json
      }
      can_add_user: { Args: { p_company_id: string }; Returns: boolean }
      can_add_vehicle: { Args: { p_company_id: string }; Returns: boolean }
      check_document_expiry: { Args: never; Returns: undefined }
      check_email_rate_limit: { Args: { p_user_id: string }; Returns: boolean }
      check_maintenance_due: { Args: never; Returns: undefined }
      check_rental_availability: {
        Args: {
          p_end: string
          p_exclude_rental_id?: string
          p_start: string
          p_vehicle_id: string
        }
        Returns: boolean
      }
      check_subscription_sync: {
        Args: never
        Returns: {
          company_id: string
          company_max_drivers: number
          company_max_vehicles: number
          company_name: string
          company_plan: string
          sub_user_limit: number
          sub_vehicle_limit: number
          subscription_plan: string
          sync_status: string
        }[]
      }
      cleanup_expired_pending_registrations: { Args: never; Returns: number }
      cleanup_old_webhook_events: {
        Args: { p_retention_days?: number }
        Returns: number
      }
      column_exists: {
        Args: { p_column: string; p_table: string }
        Returns: boolean
      }
      create_fuel_session:
        | {
            Args: {
              p_company_id: string
              p_driver_id: string
              p_vehicle_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_driver_name?: string
              p_fuels: Json
              p_station_name?: string
              p_token: string
              p_vehicle_id: string
            }
            Returns: Json
          }
      create_inspection_safe: {
        Args: {
          p_adblue_level?: number
          p_cleanliness_cargo_area?: number
          p_cleanliness_exterior?: number
          p_cleanliness_interior?: number
          p_company_id: string
          p_compartment_c1_temp?: number
          p_compartment_c2_temp?: number
          p_created_by?: string
          p_driver_name?: string
          p_driver_signature?: string
          p_fuel_level: number
          p_gnr_level?: number
          p_grade?: string
          p_inspector_notes?: string
          p_location?: string
          p_mileage: number
          p_photos?: Json
          p_reported_defects?: Json
          p_score?: number
          p_status?: string
          p_tires_condition?: Json
          p_vehicle_id: string
        }
        Returns: Json
      }
      create_pending_registration: {
        Args: {
          p_company_name: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_password_hash: string
          p_phone: string
          p_plan_type: string
          p_price_id: string
          p_siret: string
        }
        Returns: {
          email: string
          id: string
          setup_token: string
        }[]
      }
      create_public_fuel_record: {
        Args: {
          p_driver_name?: string
          p_fuel_type: string
          p_liters: number
          p_mileage: number
          p_price_total: number
          p_station_name?: string
          p_token: string
          p_vehicle_id: string
        }
        Returns: Json
      }
      create_public_inspection: {
        Args: {
          p_driver_name?: string
          p_fuel_level?: number
          p_grade?: string
          p_location?: string
          p_mileage: number
          p_reported_defects?: Json
          p_score?: number
          p_token: string
          p_vehicle_id: string
        }
        Returns: Json
      }
      fix_my_profile: { Args: never; Returns: string }
      generate_rental_reference: { Args: never; Returns: string }
      get_current_driver_vehicle_id: { Args: never; Returns: string }
      get_current_user_company_id: { Args: never; Returns: string }
      get_driver_vehicle_id: { Args: { driver_uuid: string }; Returns: string }
      get_plan_limits: {
        Args: { p_plan: Database["public"]["Enums"]["plan_type"] }
        Returns: {
          features: Json
          price_monthly: number
          user_limit: number
          vehicle_limit: number
        }[]
      }
      get_user_company_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      get_vehicle_compliance_rules: {
        Args: { p_vehicle_id: string }
        Returns: {
          activity: Database["public"]["Enums"]["transport_activity"]
          document_code: string
          document_name: string
          equipment_list: string[]
          frequency_months: number
          is_mandatory: boolean
          reminder_days: number
          requires_equipment: boolean
          rule_id: string
        }[]
      }
      get_vehicle_prediction_features: {
        Args: { p_vehicle_id: string }
        Returns: Json
      }
      increment_cache_hit: { Args: { cache_id: string }; Returns: undefined }
      insert_webhook_event_idempotent: {
        Args: {
          p_event_type: string
          p_payload: Json
          p_retry_count?: number
          p_stripe_event_id: string
        }
        Returns: {
          existing_created_at: string
          is_new: boolean
        }[]
      }
      log_activity: {
        Args: {
          p_action_type: string
          p_company_id: string
          p_description?: string
          p_entity_id?: string
          p_entity_name?: string
          p_entity_type?: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: string
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: number
      }
      submit_control_result: {
        Args: {
          p_alert_id: string
          p_anomaly_details?: string
          p_control_result: string
          p_maintenance_needed?: boolean
          p_new_score: number
        }
        Returns: Json
      }
      update_vehicle_mileage: {
        Args: { p_mileage: number; p_vehicle_id: string }
        Returns: Json
      }
      verify_qr_token: {
        Args: { p_token: string; p_vehicle_id: string }
        Returns: Json
      }
    }
    Enums: {
      defect_category:
        | "MECANIQUE"
        | "ELECTRIQUE"
        | "CARROSSERIE"
        | "PNEUMATIQUE"
        | "PROPRETE"
        | "AUTRE"
      defect_severity: "MINEUR" | "MAJEUR" | "CRITIQUE"
      inspection_status:
        | "PENDING"
        | "COMPLETED"
        | "ISSUES_FOUND"
        | "CRITICAL_ISSUES"
        | "REFUSEE"
        | "VALIDATED"
      plan_type:
        | "STARTER"
        | "BASIC"
        | "PRO"
        | "ENTERPRISE"
        | "ESSENTIAL"
        | "UNLIMITED"
      subscription_status:
        | "TRIALING"
        | "ACTIVE"
        | "PAST_DUE"
        | "CANCELED"
        | "UNPAID"
      transport_activity:
        | "MARCHANDISES_GENERALES"
        | "FRIGORIFIQUE"
        | "ADR_COLIS"
        | "ADR_CITERNE"
        | "CONVOI_EXCEPTIONNEL"
        | "BENNE_TRAVAUX_PUBLICS"
        | "ANIMAUX_VIVANTS"
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
    Enums: {
      defect_category: [
        "MECANIQUE",
        "ELECTRIQUE",
        "CARROSSERIE",
        "PNEUMATIQUE",
        "PROPRETE",
        "AUTRE",
      ],
      defect_severity: ["MINEUR", "MAJEUR", "CRITIQUE"],
      inspection_status: [
        "PENDING",
        "COMPLETED",
        "ISSUES_FOUND",
        "CRITICAL_ISSUES",
        "REFUSEE",
        "VALIDATED",
      ],
      plan_type: [
        "STARTER",
        "BASIC",
        "PRO",
        "ENTERPRISE",
        "ESSENTIAL",
        "UNLIMITED",
      ],
      subscription_status: [
        "TRIALING",
        "ACTIVE",
        "PAST_DUE",
        "CANCELED",
        "UNPAID",
      ],
      transport_activity: [
        "MARCHANDISES_GENERALES",
        "FRIGORIFIQUE",
        "ADR_COLIS",
        "ADR_CITERNE",
        "CONVOI_EXCEPTIONNEL",
        "BENNE_TRAVAUX_PUBLICS",
        "ANIMAUX_VIVANTS",
      ],
    },
  },
} as const
