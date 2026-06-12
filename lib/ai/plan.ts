export type UserPlan = "free" | "pro" | "enterprise";

export function isProPlan(plan: string | null | undefined): boolean {
  return plan === "pro" || plan === "enterprise";
}
