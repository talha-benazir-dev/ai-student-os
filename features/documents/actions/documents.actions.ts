"use server";

import { createClient } from "@/lib/supabase/server";

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
  subject: string
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
        page_count: null,
        ai_summary: null,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function deleteDocument(id: string, file_url: string) {
  const supabase = await createClient();

  // Extract filePath from file_url (everything after '/documents/')
  const bucketName = "documents";
  const urlParts = file_url.split(`/${bucketName}/`);
  
  if (urlParts.length >= 2) {
    const filePath = urlParts[1];
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (storageError) {
      return { data: null, error: storageError };
    }
  }

  // Delete from DB
  const { data, error } = await supabase.from("documents").delete().eq("id", id);

  return { data, error };
}
