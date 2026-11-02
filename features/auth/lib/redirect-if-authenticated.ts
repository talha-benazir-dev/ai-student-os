import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";

export async function redirectIfAuthenticated() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  redirect(profile?.onboarded === true ? "/dashboard" : "/onboarding");
}
