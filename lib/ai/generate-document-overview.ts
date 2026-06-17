import { callAnthropicJson } from "@/lib/ai/anthropic";
import { detectTextLanguage } from "@/lib/ai/detect-language";

const RAW_TEXT_LIMIT = 12_000;

function buildSystemPrompt(rawText: string): string {
  const detected = detectTextLanguage(rawText);
  const languageRule = detected
    ? `Write the overview in ${detected}, matching the document's language.`
    : "Infer the document's language from its content and write the overview in that same language.";

  return `You are a study assistant for Nucleus. Write a quick overview of an uploaded study document for a student.

Rules:
- Write exactly 3 to 5 sentences.
- Plain text only — no markdown, headings, or bullet points.
- Focus on what the document covers and why it matters for studying.
- ${languageRule}
- Do not mention that you are an AI.`;
}

export async function generateDocumentOverview(
  title: string,
  rawText: string,
): Promise<string> {
  const excerpt = rawText.slice(0, RAW_TEXT_LIMIT);
  const systemPrompt = buildSystemPrompt(excerpt);
  const userPrompt = `Document title: "${title}"

Document content:
---
${excerpt}
---

Write the quick overview.`;

  const overview = await callAnthropicJson(systemPrompt, userPrompt);
  return overview.trim();
}
