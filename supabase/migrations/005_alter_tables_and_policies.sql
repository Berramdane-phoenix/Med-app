-- Notifications and reminders schemas and RLS

-- Notifications table
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE POLICY "Allow select own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Allow insert own notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Allow delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- Reminders table
DROP TABLE IF EXISTS public.reminders CASCADE;

CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  appointment_id UUID REFERENCES public.appointments(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority = ANY (ARRAY['high','medium','low'])),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE POLICY "Allow select own reminders"
  ON public.reminders
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Allow insert own reminders"
  ON public.reminders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow update own reminders"
  ON public.reminders
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Allow delete own reminders"
  ON public.reminders
  FOR DELETE
  USING (user_id = auth.uid());
