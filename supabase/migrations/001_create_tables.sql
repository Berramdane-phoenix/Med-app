-- Doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  location TEXT,
  bio TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  education TEXT[],
  experience INTEGER,
  languages TEXT[],
  rating NUMERIC,
  review_count INTEGER,
  available_days TEXT[],
  consultation_fee NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_available BOOLEAN DEFAULT true,
  working_hours JSONB DEFAULT '{"start":"09:00","end":"17:00"}',
  slot_duration_minutes INTEGER DEFAULT 30,
  profile_image_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC'
);

-- Create pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;
