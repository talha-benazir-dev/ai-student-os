import type { Metadata } from "next";
import SettingsPage from "@/features/settings/components/settings";

export const metadata: Metadata = {
  title: "Settings — Nucleus",
  description: "Profile, plan, and preferences.",
};

export default function Page() {
  return <SettingsPage />;
}
