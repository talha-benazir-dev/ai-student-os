import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "Nucleus — Study OS",
  description: "Your AI study operating system.",
};

export default function Page() {
  return <LandingPage />;
}
