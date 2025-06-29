-- Appointments table
DROP TABLE IF EXISTS public.appointments CASCADE;

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  title TEXT NOT NULL,
  duration INTERVAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT appointments_status_check CHECK (
    status = ANY (ARRAY['pending','booked','confirmed','cancelled','rescheduled'])
  ),
  CONSTRAINT unique_doctor_datetime UNIQUE (doctor_id, datetime)
);

CREATE INDEX IF NOT EXISTS appointments_datetime_idx ON public.appointments(datetime);
CREATE INDEX IF NOT EXISTS appointments_user_id_idx ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS appointments_doctor_id_idx ON public.appointments(doctor_id);
