// pages/api/doctors/[id]/profile.ts
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid doctor id" });
    }

    const { data: doctor, error } = await supabase
        .from("doctors")
        .select(`
        id,
        name,
        specialty,
        bio,
        photo,
        email,
        phone,
        education,
        experience,
        languages,
        rating,
        review_count
        `)
        .eq("id", id)
        .single();

    if (error || !doctor) {
        return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json(doctor);
}
