import { Suspense } from "react";
import type { Metadata } from "next";
import AnalyticsPage from "@/features/analytics/components/analytics";
import { parseAnalyticsPeriod } from "@/features/analytics/lib/date-utils";

export const metadata: Metadata = {
  title: "Analytics — Nucleus",
  description: "A long view of your focus and consistency.",
};

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { period: rawPeriod } = await searchParams;
  const period = parseAnalyticsPeriod(rawPeriod);

  return (
    <Suspense fallback={null}>
      <AnalyticsPage period={period} />
    </Suspense>
  );
}
