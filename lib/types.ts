// User detail for user detail page
export interface UserDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  phone?: string;
  address?: string;
  avatar_url?: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  recent_activities?: { description: string; timestamp: string; type: string }[];
}
// System config for system page
export interface SystemConfig {
  maintenance_mode: boolean;
  allow_registrations: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  auto_backup: boolean;
  backup_frequency: number;
  max_file_size: number;
  session_timeout: number;
}

// System log for system page
export interface SystemLog {
  id: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  source: string;
  timestamp: string;
}
// Mechanic detail for mechanic detail page
export interface MechanicDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  phone?: string;
  location?: string;
  avatar_url?: string;
  status: "active" | "inactive" | "pending";
  rating: number;
  experience_years: number;
  hourly_rate: number;
  specializations?: string | string[]; // Can be a string or an array of strings
  created_at: string;
  services?: any[];
  reviews?: any[];
  upcoming_appointments?: any[];
}
// Dashboard metrics for dashboard page
export interface DashboardMetrics {
  revenue_data: { month: string; revenue: number }[];
  completion_rate: number;
  avg_response_time: number;
  satisfaction_score: number;
  mechanic_utilization: number;
}

// Dashboard activity for dashboard page
export interface DashboardActivity {
  recent_activities: {
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }[];
}

// Dashboard notifications for dashboard page
export interface DashboardNotifications {
  notifications: {
    title: string;
    message: string;
    timestamp: string;
    priority: string;
  }[];
}
// Dashboard overview for dashboard page

export interface DashboardOverview {
  total_users: number
  total_mechanics: number
  total_vehicles: number
  total_services: number
  total_chats: number
  total_feedback: number
  today_users: number
  today_services: number
  today_chats: number
  pending_verification: number
  active_services: number
  timestamp: string
  // Add any other fields your backend returns
  system_health?: {
    cpu: number
    memory: number
    disk: number
  }
  user_growth_data?: any[]
  service_distribution?: any[]
}
// User statistics for admin stats page
export interface UserStats {
  total_users: number;
  growth_rate: number;
  new_users_this_month: number;
  active_users: number;
  inactive_users: number;
  active_percentage: number;
  inactive_percentage: number;
  growth_data: { month: string; users: number }[];
  status_distribution: { name: string; value: number }[];
  daily_active_users: { date: string; active_users: number }[];
  demographics: { age_group: string; count: number }[];
  registrations_today: number;
  registrations_this_week: number;
  registrations_this_month: number;
  avg_session_duration: number;
  return_rate: number;
  bounce_rate: number;
  top_locations: { city: string; count: number }[];
}
// Chat message for chat sessions
export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}
// Report type for reports page
export interface Report {
  id: string;
  title: string;
  type: string;
  status: "generating" | "completed" | "failed";
  created_at: string;
  file_size?: number;
  filename?: string;
  description?: string;
  parameters?: Record<string, any>;
}
// User profile for settings page
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  bio?: string;
}

// App settings for settings page
export interface AppSettings {
  company_name: string;
  company_logo?: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  business_hours: string;
  timezone: string;
  currency: string;
  language: string;
  theme: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
}
import type React from "react"
// TypeScript interfaces for API data models

export interface User {
  id: string
  email: string
  name: string
  phone_number?: string
  created_at: string
  updated_at: string
  is_verified: boolean
  is_active: boolean
}

export interface Mechanic {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  cnic?: string;
  province?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  expertise?: string | string[];
  years_of_experience?: number;
  profile_picture?: string;
  cnic_front?: string;
  cnic_back?: string;
  workshop_name?: string;
  working_days?: string | string[];
  // Correctly represents the nested working hours object from the backend
  working_hours?: {
    start_time: string;
    end_time: string;
  };
  is_verified?: boolean;
  is_active?: boolean;
  rating?: number;
  specialization?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string
  user_id: string
  mechanic_id?: string
  vehicle_id: string
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
  completed_at?: string
}

export type VehicleType = "car" | "bike" | "truck" | "van" | "suv" | "bus" | "other"
export type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "cng" | "lpg" | "hydrogen" | "other"
export type TransmissionType = "manual" | "automatic" | "semi_automatic" | "cvt" | "dual_clutch" | "other"

export interface UserOut {
  id: string
  first_name: string
  last_name: string
  email: string
  profile_picture?: string
  phone_number?: string
  initials?: string
}

export interface Vehicle {
  _id: string; // Changed from id to _id
  user_id: string;
  model: string;
  brand?: string;
  year?: number;
  type: VehicleType;
  fuel_type?: FuelType;
  transmission?: TransmissionType;
  history?: string;
  images: string[];
  registration_number?: string;
  mileage_km: number;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  display_name: string; // New field from data
  owner?: UserOut;
}

export interface UserOut {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_picture?: string;
  initials?: string;
}

export interface Feedback {
  _id: string
  user_id: string
  mechanic_id: string
  service_id?: string
  ai_service_id?: string
  status: "reviewed" | "flagged" | "resolved" | "deleted" | "hidden"
  title?: string
  description?: string
  rating?: number
  created_at: string
  updated_at?: string
  is_editable: boolean
  age_days: number
}

export interface ChatSession {
  _id: string
  user_id: string
  created_at: string
  updated_at: string
  chat_title?: string
  chat_history?: ChatMessage[]
  vehicle_info?: Vehicle
  image_history?: string[]
  preview?: string
}

export interface AnalyticsData {
  users: {
    total: number
    active: number
    new_this_month: number
    growth_rate: number
  }
  mechanics: {
    total: number
    verified: number
    pending: number
    average_rating: number
  }
  services: {
    total: number
    completed: number
    in_progress: number
    completion_rate: number
  }
  system: {
    uptime: number
    response_time: number
    error_rate: number
  }
}

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
}

export interface FormField {
  name: string
  label: string
  type: "text" | "email" | "number" | "select" | "textarea" | "checkbox"
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}
