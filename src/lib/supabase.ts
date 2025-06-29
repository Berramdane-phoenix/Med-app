import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Doctor = {
  id: string
  name: string
  specialty: string
  location: string
  bio: string
  available_days: string[]
  working_hours: {
    start: string
    end: string
  }
  slot_duration_minutes: number
  profile_image_url?: string
  timezone?: string 
}

export type Appointment = {
  id: string
  user_id: string
  doctor_id: string
  datetime: string 
  notes?: string
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled'
  created_at: string
  updated_at: string
}

export type VitalRecord = {
  id?: string
  patient_id: string
  patient_name: string
  systolic_bp?: number
  diastolic_bp?: number
  heart_rate?: number
  temperature?: number
  oxygen_saturation?: number
  weight?: number
  height?: number
  recorded_at: string
  recorded_by: string
  notes?: string
}