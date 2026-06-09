"use server";

import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

export async function getDocuments() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return { data: null, error: userError };
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function createDocument(
  title: string,
  file_url: string,
  file_size: number,
  subject: string,
  cloudinary_public_id: string,
) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return { data: null, error: userError };
  }

  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        user_id: userData.user.id,
        title,
        file_url,
        file_size,
        subject,
        cloudinary_public_id,
        page_count: null,
        ai_summary: null,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function deleteDocument(
  id: string,
  cloudinary_public_id: string | null,
) {
  const supabase = await createClient();

  // Delete from Cloudinary if public_id exists
  if (cloudinary_public_id) {
    const timestamp = Math.floor(Date.now() / 1000);
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !apiSecret || !cloudName) {
      return { data: null, error: new Error("Server configuration error") };
    }

    const signatureString = `public_id=${cloudinary_public_id}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(signatureString).digest("hex");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: cloudinary_public_id,
          api_key: apiKey,
          timestamp,
          signature,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary delete error:", errorText);
      return { data: null, error: new Error("Cloudinary delete failed") };
    }
  }

  // Delete from DB
  const { data, error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  return { data, error };
}
