import type { Metadata } from "next";
import AnalyticsPage from "@/features/analytics/components/analytics";

export const metadata: Metadata = {
  title: "Analytics — Nucleus",
  description: "A long view of your focus and consistency.",
};

export default function Page() {
  return <AnalyticsPage />;
}
