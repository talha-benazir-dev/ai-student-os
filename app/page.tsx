import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "Nucleus — Make room to understand",
  description: "One considered space for your notes, tasks, readings, and review. Find your next step and make room to understand.",
};

export default function Page() {
  return <LandingPage />;
}
