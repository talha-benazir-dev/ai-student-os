import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const backend = "http://127.0.0.1:54329";
const screenshots = "/tmp/nucleus-qa";
mkdirSync(screenshots, { recursive: true });

async function signIn(context) {
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    email: "alex@example.com",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, aud: "authenticated", exp, role: "authenticated" })}.test-signature`;
  const session = {
    access_token: token,
    refresh_token: "test-refresh",
    token_type: "bearer",
    expires_at: exp,
    expires_in: 3600,
    user,
  };
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value: `base64-${encode(session)}`,
      url: "http://127.0.0.1:3100",
    },
  ]);
}

test("dashboard shares auth checks and fetches only visible charts", async ({
  context,
  request,
}) => {
  await signIn(context);
  await request.get(`${backend}/__reset`);
  const response = await context.request.get("/dashboard");
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain("Welcome back,");
  const calls = await (await request.get(`${backend}/__requests`)).json();
  expect(
    calls.filter((call) => call.path === "/auth/v1/user").length,
  ).toBeLessThanOrEqual(2);
  expect(
    calls.filter((call) => call.select === "week_starts_on").length,
  ).toBeLessThanOrEqual(1);
  console.log("Dashboard backend requests:", calls.length);
  expect(
    calls.filter(
      (call) =>
        call.select ===
        "cluster_id,completed,updated_at,due_date,importance_points",
    ),
  ).toHaveLength(0);
});

test("landing page avoids private data requests even with a session", async ({
  context,
  page,
  request,
}) => {
  await signIn(context);
  await request.get(`${backend}/__reset`);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const calls = await (await request.get(`${backend}/__requests`)).json();
  expect(calls).toHaveLength(0);
});

test("navigation responds while data is slow and completion updates immediately", async ({
  context,
  page,
  request,
}) => {
  await signIn(context);
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex" }),
  ).toBeVisible();
  await request.get(`${backend}/__reset?delay=800`);
  await page.getByRole("link", { name: "Tasks", exact: true }).first().click();
  await expect(page.getByRole("status", { name: "Opening page" })).toBeVisible({
    timeout: 1500,
  });
  await expect(page.getByText("Review cell biology").first()).toBeVisible();
  const checkbox = page.getByRole("checkbox").first();
  await checkbox.click();
  await expect(checkbox).toBeChecked({ timeout: 500 });
  await expect(checkbox).toBeChecked();
});

test("anonymous visitors are redirected away from private pages", async ({
  page,
}) => {
  await page.goto("/notes");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
});

test("landing navigation and layout work on mobile without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await expect(
    page.getByRole("link", { name: "Create your workspace" }).first(),
  ).toBeVisible();
  await context.close();
});

test("new student can follow the guide to create a subject and a first note", async ({
  context,
  page,
  request,
}) => {
  await signIn(context);
  await request.get(`${backend}/__reset?scenario=empty`);
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Add your first subject" }).click();
  const subjectDialog = page.getByRole("dialog", { name: "New subject" });
  await expect(subjectDialog).toBeVisible();
  await subjectDialog.getByRole("textbox", { name: "Name" }).fill("Biology");
  await subjectDialog
    .getByRole("button", { name: "Create", exact: true })
    .click();
  await expect(subjectDialog).not.toBeVisible();
  await page.goto("/dashboard");
  await page
    .getByRole("link", { name: "Write your first note", exact: true })
    .first()
    .click();
  const noteDialog = page.getByRole("dialog", { name: "Create a new note" });
  await expect(noteDialog).toBeVisible();
  await noteDialog.getByRole("button", { name: /Text note/i }).click();
  await expect(
    page.getByRole("textbox", { name: "Note title", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Note title", exact: true })
    .fill("My first biology note");
  await page
    .getByRole("textbox", { name: "Note content", exact: true })
    .fill("Osmosis is water moving across a partially permeable membrane.");
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /^My first biology note/ }).click();
  await expect(
    page.getByRole("textbox", { name: "Note content", exact: true }),
  ).toHaveValue(/Osmosis/);
  await page.goto("/dashboard");
  await page
    .getByRole("link", { name: "Add a study task", exact: true })
    .click();
  const taskDialog = page.getByRole("dialog", {
    name: "New task",
    exact: true,
  });
  await taskDialog
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Explain osmosis in my own words");
  await taskDialog.getByRole("button", { name: /Create task/i }).click();
  const completion = page.getByRole("checkbox", {
    name: "Mark Explain osmosis in my own words as complete",
  });
  await expect(completion).toBeEnabled();
  await completion.click();
  await expect(page.getByRole("checkbox", { name: "Mark Explain osmosis in my own words as incomplete" })).toBeChecked();
  // Wait for persistence, then confirm the next suggestion leads to retrieval practice.
  await expect
    .poll(async () =>
      (await (await request.get(`${backend}/__requests`)).json()).some(
        (call) => call.path === "/rest/v1/tasks" && call.method === "PATCH",
      ),
    )
    .toBeTruthy();
  await page.goto("/dashboard");
  await page
    .getByRole("link", { name: "Make a review card", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: /Create Flashcard/i }),
  ).toBeVisible();
});

test("due-card guidance opens a real review session", async ({
  context,
  page,
  request,
}) => {
  await signIn(context);
  await request.get(`${backend}/__reset?scenario=due`);
  await page.goto("/dashboard");
  await page
    .getByRole("link", { name: "Review due cards", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Review Session" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reveal answer", exact: true }),
  ).toBeVisible();
});

test("timer is ready without queued startup actions and survives a reload", async ({
  context,
  page,
  request,
}) => {
  await signIn(context);
  await request.get(`${backend}/__reset`);
  const startupActions = [];
  page.on("request", (req) => {
    if (
      req.method() === "POST" &&
      req.url().startsWith("http://127.0.0.1:3100/")
    )
      startupActions.push(req.url());
  });
  await page.goto("/dashboard");
  await expect(
    page.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  expect(startupActions).toHaveLength(0);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Stop", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
});

test("New commands also work when their page is already open", async ({
  context,
  page,
  request,
}) => {
  await signIn(context);
  await request.get(`${backend}/__reset`);
  for (const [path, command, dialog] of [
    ["/tasks", /^New task/i, /New task/i],
    ["/notes", /^New note/i, /Create a new note/i],
    ["/flashcards", /^New flashcard/i, /Create Flashcard/i],
  ]) {
    await page.goto(path);
    for (let repeat = 0; repeat < 2; repeat++) {
      await page.keyboard.press("Control+k");
      await page.getByRole("option", { name: command }).click();
      await expect(page.getByRole("dialog", { name: dialog })).toBeVisible();
      await expect(page).toHaveURL(`http://127.0.0.1:3100${path}`);
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("dialog", { name: dialog }),
      ).not.toBeVisible();
    }
  }
});

test("sidebar still responds when browser storage is unavailable", async ({
  context,
  page,
  request,
}) => {
  await signIn(context);
  await request.get(`${backend}/__reset`);
  await context.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "QuotaExceededError");
    };
  });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(
    page.getByRole("button", { name: "Collapse sidebar" }),
  ).toBeVisible();
});

test("desktop and mobile layouts, preview controls, and workspace pages", async ({
  context,
  page,
  request,
}) => {
  await request.get(`${backend}/__reset`);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${screenshots}/landing-desktop.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Tasks", exact: true })
    .first()
    .click();
  const sampleTask = page.getByRole("button", {
    name: /Explain active transport/,
  });
  await sampleTask.click();
  await expect(sampleTask).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Review", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Reveal answer" }).click();
  await expect(
    page.getByRole("button", { name: "Show question" }),
  ).toBeVisible();
  await signIn(context);
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex" }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${screenshots}/home-desktop.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: /^Cell transport/ }).click();
  await expect(
    page.getByRole("textbox", { name: "Note title", exact: true }),
  ).toHaveValue("Cell transport");
  for (const path of [
    "/notes",
    "/tasks",
    "/documents",
    "/flashcards",
    "/clusters",
    "/analytics",
    "/settings",
    "/ai",
  ]) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({
      path: `${screenshots}/${path.slice(1)}-desktop.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  for (const width of [375, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/dashboard",
      "/tasks",
      "/notes",
      "/documents",
      "/flashcards",
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      if (width === 375 && (path === "/" || path === "/dashboard"))
        await page.screenshot({
          path: `${screenshots}/${path === "/" ? "landing" : "home"}-mobile.png`,
          fullPage: true,
        });
    }
  }
  expect(errors).toEqual([]);
});
