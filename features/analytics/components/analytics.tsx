import { StudyChart, FocusBars } from "@/features/dashboard/components/charts";

export default function AnalyticsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 mx-auto w-full max-w-[1400px]">
      <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">Analytics</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">A long view of your focus and consistency.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-2">Weekly hours</h2>
          <StudyChart />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-2">Focus depth</h2>
          <FocusBars />
        </div>
      </div>
    </div>
  );
}

