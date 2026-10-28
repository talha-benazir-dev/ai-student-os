import { test } from "node:test";
import assert from "node:assert/strict";
import { getStudyNextStep } from "../features/dashboard/lib/study-next-step.ts";

const empty = { clusters: 0, notes: 0, documents: 0, tasks: 0, dueCards: 0 };
test("a new student starts with one cluster, not an empty analytics dashboard", () => {
  const step = getStudyNextStep(empty);
  assert.equal(step.href, "/clusters?new=cluster");
  assert.equal(step.title, "Create your first cluster");
});
test("students with a cluster are guided to capture material", () => {
  assert.equal(
    getStudyNextStep({ ...empty, clusters: 1 }).href,
    "/notes?new=note",
  );
});
test("material without a task leads to a small study goal", () => {
  assert.equal(
    getStudyNextStep({ ...empty, clusters: 1, documents: 1 }).href,
    "/tasks?new=task",
  );
});
test("due reviews take priority over new tasks", () => {
  assert.equal(
    getStudyNextStep({ ...empty, tasks: 4, dueCards: 3 }).href,
    "/flashcards?review=due",
  );
});
test("a student with tasks is directed to choose one", () => {
  assert.equal(getStudyNextStep({ ...empty, tasks: 2 }).href, "/tasks");
});

test("finishing a study task leads to recall instead of more busywork", () => {
  assert.equal(
    getStudyNextStep({ ...empty, notes: 1, completedTasks: 1 }).href,
    "/flashcards?new=card",
  );
});
