export const UPGRADE_TOAST =
  "AI features require a Pro plan — upgrade at /#pricing";

export type AiApiErrorKind = "upgrade_required" | "unauthorized" | "unknown";

export function parseAiApiError(
  status: number,
  body: { error?: string },
): AiApiErrorKind {
  if (status === 403 && body.error === "upgrade_required") {
    return "upgrade_required";
  }
  if (status === 401 && body.error === "unauthorized") {
    return "unauthorized";
  }
  return "unknown";
}
