// An isolated HTTP stand-in for Supabase. Never connects to the live project.
import { createServer } from "node:http";

const id = "11111111-1111-4111-8111-111111111111";
const now = new Date().toISOString();
const profile = {
  id,
  name: "Alex",
  plan: "free",
  onboarded: true,
  theme: "Graphite",
  study_hours_period: "week",
  week_starts_on: 1,
  dashboard_widgets: ["daily_study_time", "activity_heatmap"],
  study_stage: "University",
  subjects: ["Biology"],
  country: "Bangladesh",
  created_at: now,
  updated_at: now,
};
const initialTask = {
  id: "22222222-2222-4222-8222-222222222222",
  user_id: id,
  title: "Review cell biology",
  completed: false,
  priority: "medium",
  due_date: null,
  reward: "",
  importance_points: 3,
  cluster_id: null,
  created_at: now,
  updated_at: now,
};
let tasks = [{ ...initialTask }];
let notes = [];
let documents = [];
let clusters = [];
let flashcards = [];
let sessions = [];
let requests = [];
let delay = 0;

createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:54329");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,HEAD,OPTIONS",
  );
  res.setHeader("Access-Control-Expose-Headers", "Content-Range");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") return res.end();
  if (url.pathname === "/__requests") return res.end(JSON.stringify(requests));
  if (url.pathname === "/__reset") {
    requests = [];
    delay = Number(url.searchParams.get("delay") ?? 0);
    const scenario = url.searchParams.get("scenario") ?? "established";
    profile.plan = scenario === "pro" ? "pro" : "free";
    documents =
      scenario === "pro"
        ? [
            {
              id: "66666666-6666-4666-8666-666666666666",
              user_id: id,
              title: "Cell biology reading",
              file_url: "https://example.com/reading.pdf",
              file_size: 123481,
              page_count: 3,
              ai_summary: null,
              cloudinary_public_id: "test-reading",
              cluster_id: "33333333-3333-4333-8333-333333333333",
              raw_text: "Cell transport lecture reading.",
              created_at: now,
            },
          ]
        : [];
    tasks = scenario === "empty" ? [] : [{ ...initialTask }];
    clusters =
      scenario === "empty"
        ? []
        : [
            {
              id: "33333333-3333-4333-8333-333333333333",
              user_id: id,
              name: "Biology",
              color: "#a6be98",
              created_at: now,
              updated_at: now,
            },
          ];
    notes =
      scenario === "empty"
        ? []
        : [
            {
              id: "44444444-4444-4444-8444-444444444444",
              user_id: id,
              title: "Cell transport",
              content:
                "Passive transport follows the concentration gradient. Active transport uses energy from ATP.",
              type: "text",
              cluster_id: clusters[0].id,
              created_at: now,
              updated_at: now,
            },
          ];
    flashcards =
      scenario === "due"
        ? [
            {
              id: "55555555-5555-4555-8555-555555555555",
              user_id: id,
              front: "What happens during osmosis?",
              back: "Water moves across a partially permeable membrane.",
              difficulty: "medium",
              next_review: now.slice(0, 10),
              interval_days: 1,
              repetitions: 0,
              cluster_id: null,
              created_at: now,
            },
          ]
        : [];
    sessions = [];
    return res.end("{}");
  }
  requests.push({
    path: url.pathname,
    select: url.searchParams.get("select"),
    method: req.method,
  });
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  if (url.pathname === "/auth/v1/user") {
    return res.end(
      JSON.stringify({
        id,
        aud: "authenticated",
        role: "authenticated",
        email: "alex@example.com",
        created_at: now,
        app_metadata: {},
        user_metadata: {},
      }),
    );
  }
  const table = url.pathname.split("/").at(-1);
  // Mirror the live documents schema: invalid projections fail even with no rows.
  if (table === "documents") {
    const columns = new Set([
      "id",
      "user_id",
      "title",
      "file_url",
      "file_size",
      "page_count",
      "ai_summary",
      "created_at",
      "cloudinary_public_id",
      "cluster_id",
      "raw_text",
    ]);
    const unknown = (url.searchParams.get("select") ?? "*")
      .split(",")
      .map((column) => column.trim())
      .find((column) => column !== "*" && !columns.has(column));
    if (unknown) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          code: "42703",
          message: `column documents.${unknown} does not exist`,
          details: null,
          hint: null,
        }),
      );
    }
  }
  let data = [];
  if (table === "profiles") data = [profile];
  if (table === "streaks") data = [{ current_streak: 3, longest_streak: 7 }];
  const collections = {
    tasks,
    notes,
    documents,
    clusters,
    flashcards,
    study_sessions: sessions,
  };
  if (table in collections) {
    data = collections[table];
    if (req.method === "POST" || req.method === "PATCH") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const values = JSON.parse(body);
      const record = Array.isArray(values) ? values[0] : values;
      if (req.method === "POST") {
        const row = {
          id: crypto.randomUUID(),
          user_id: id,
          created_at: now,
          updated_at: now,
          ...(table === "study_sessions"
            ? { ended_at: null, duration_minutes: null }
            : {}),
          ...record,
        };
        data.push(row);
        data = [row];
      } else {
        const target =
          data.find((row) => `eq.${row.id}` === url.searchParams.get("id")) ??
          data[0];
        Object.assign(target, record);
        data = [target];
      }
    }
    const completed = url.searchParams.get("completed");
    if (completed)
      data = data.filter((row) => row.completed === (completed === "eq.true"));
    if (url.searchParams.get("ended_at") === "is.null")
      data = data.filter((row) => row.ended_at === null);
    if (url.searchParams.get("duration_minutes") === "not.is.null")
      data = data.filter((row) => row.duration_minutes !== null);
  }
  res.setHeader(
    "Content-Range",
    `0-${Math.max(0, data.length - 1)}/${data.length}`,
  );
  if (req.headers.accept?.includes("application/vnd.pgrst.object+json")) {
    if (!data.length) {
      res.statusCode = 406;
      return res.end(
        JSON.stringify({
          code: "PGRST116",
          details: "The result contains 0 rows",
          message: "No rows",
        }),
      );
    }
    return res.end(JSON.stringify(data[0]));
  }
  res.end(JSON.stringify(data));
}).listen(54329, "127.0.0.1");
