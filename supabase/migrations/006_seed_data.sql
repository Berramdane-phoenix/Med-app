-- Sample doctors
INSERT INTO public.doctors (id, name, specialty, location, bio, email, phone, education, experience, languages, rating, review_count, available_days, consultation_fee, is_available, working_hours, slot_duration_minutes, profile_image_url)
VALUES
  (gen_random_uuid(), 'Dr. Daniel Kim', 'Orthopedics', 'Seattle, WA', 'Orthopedic surgeon specializing in sports injuries.', 'daniel.kim@example.com', '+1-555-3456', ARRAY['MD, University of Washington'], 12, ARRAY['English','Korean'], 4.7, 85, ARRAY['Monday','Tuesday','Thursday','Friday'], 140.00, true, '{"start":"07:30","end":"15:30"}', 25, 'https://.../doctor-daniel.jpg'),
  (gen_random_uuid(), 'Dr. Emily Rodriguez', 'Neurology', 'Miami, FL', 'Neurologist focusing on brain and nervous system disorders.', 'emily.rodriguez@example.com', '+1-555-7890', ARRAY['MD, Johns Hopkins University'], 14, ARRAY['English','Spanish'], 4.6, 110, ARRAY['Tuesday','Wednesday','Friday'], 160.00, true, '{"start":"09:00","end":"17:00"}', 30, 'https://.../emily.jpg');

-- Sample medications for a user
INSERT INTO public.medications (user_id, name, dosage, frequency, next_dose)
VALUES
  ('57bcd602-feb5-489f-8628-6ef762812c69', 'Lisinopril', '10mg', 'Once daily', '2025-06-23 08:00:00+00'),
  ('57bcd602-feb5-489f-8628-6ef762812c69', 'Metformin', '500mg', 'Twice daily', '2025-06-22 18:00:00+00'),
  ('57bcd602-feb5-489f-8628-6ef762812c69', 'Albuterol Inhaler', '2 puffs', 'As needed', '2025-06-22 12:00:00+00'),
  ('57bcd602-feb5-489f-8628-6ef762812c69', 'Atorvastatin', '20mg', 'Once daily at night', '2025-06-22 22:00:00+00'),
  ('57bcd602-feb5-489f-8628-6ef762812c69', 'Omeprazole', '20mg', 'Once daily before breakfast', '2025-06-23 07:30:00+00');

-- Sample medical records
INSERT INTO public.medical_records (user_id, title, description, date, doctor_name, document_url)
VALUES
  ('57bcd602-feb5-489f-8628-6ef762812c69', 'Annual Physical Exam', 'Routine annual health checkup.', '2024-05-10', 'Dr. Alice Smith', 'https://example.com/docs/physical_exam_2024.pdf'),
  ('57bcd602-feb5-489f-8628-6ef762812c69', 'Blood Test Results', 'Blood panel ordered due to fatigue.', '2024-04-12', 'Dr. Bob Johnson', 'https://example.com/docs/blood_test_april.pdf'),
  ('57bcd602-feb5-489f-8628-6ef762812c69', 'X-ray Report', 'X-ray of right ankle after injury.', '2024-03-05', 'Dr. Carol Lee', 'https://example.com/docs/ankle_xray.pdf');

