import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/tasks/:path*",
    "/documents/:path*",
    "/flashcards/:path*",
    "/clusters/:path*",
    "/ai/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
