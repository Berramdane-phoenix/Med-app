import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.extend(utc);
dayjs.extend(timezone);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid doctor id" });
  }

  // Fetch doctor data including availability fields
  const { data: doctor, error } = await supabase
    .from("doctors")
    .select("id, available_days, working_hours, slot_duration_minutes")
    .eq("id", id)
    .single();

  if (error || !doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  const available_days: string[] = doctor.available_days || [];
  const working_hours: { start: string; end: string } = doctor.working_hours || { start: "09:00", end: "17:00" };
  const slot_duration_minutes: number = doctor.slot_duration_minutes || 30;

  const slots: { dateTime: string }[] = [];
  const now = dayjs().tz("Europe/Dublin");

  // Fetch existing appointments for the doctor in the next 7 days
  const { data: appointments, error: apptError } = await supabase
    .from("appointments")
    .select("datetime")
    .eq("doctor_id", id)
    .gte("datetime", now.toISOString());

  if (apptError) {
    console.error("Error fetching appointments:", apptError.message);
    return res.status(500).json({ error: "Failed to load appointments" });
  }

  const bookedTimes = new Set((appointments || []).map((a) => dayjs(a.datetime).toISOString()));

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = now.add(dayOffset, "day");
    const dayName = DAYS[date.day()]; // day() returns 0=Sun ... 6=Sat

    if (!available_days.includes(dayName)) continue;

    // Correct usage of template literal with backticks for ISO string with local time
    const startTime = dayjs.tz(`${date.format("YYYY-MM-DD")}T${working_hours.start}`, "Europe/Dublin");
    const endTime = dayjs.tz(`${date.format("YYYY-MM-DD")}T${working_hours.end}`, "Europe/Dublin");

    for (let current = startTime; current.isBefore(endTime); current = current.add(slot_duration_minutes, "minute")) {
      const slotISO = current.toISOString();

      if (!bookedTimes.has(slotISO) && current.isAfter(now)) {
        slots.push({ dateTime: slotISO });
      }
    }
  }

  return res.status(200).json({ slots });
}
