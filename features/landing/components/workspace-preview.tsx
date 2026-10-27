"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckSquare,
  ChevronRight,
  FileText,
  Home,
  Layers,
  Plus,
  Search,
} from "lucide-react";
import { NucleusMark } from "@/components/nucleus-mark";

const tabs = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "review", label: "Review", icon: Layers },
] as const;

export function WorkspacePreview() {
  const [tab, setTab] = useState<"notes" | "tasks" | "review">("notes");
  const [completed, setCompleted] = useState(false);
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="workspace-preview">
      <aside className="preview-sidebar" aria-label="Example workspace">
        <div className="preview-brand">
          <NucleusMark className="size-5" />
          <strong>Nucleus</strong>
          <ChevronRight size={13} />
        </div>
        <div className="preview-search">
          <Search size={13} />
          Find in workspace<span>⌘ K</span>
        </div>
        <div className="preview-nav-item">
          <Home size={14} />
          Home
        </div>
        <span className="preview-section-label">Your library</span>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`preview-nav-item ${tab === id ? "preview-nav-active" : ""}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
        <span className="preview-section-label">Subjects</span>
        <div className="preview-nav-item">
          <i className="subject-dot subject-biology" />
          Biology
        </div>
        <div className="preview-nav-item">
          <i className="subject-dot subject-physics" />
          Physics
        </div>
        <div className="preview-nav-item">
          <i className="subject-dot subject-literature" />
          Literature
        </div>
        <div className="preview-user">
          <span>A</span>
          <div>
            Alex’s workspace<small>Personal workspace</small>
          </div>
        </div>
      </aside>
      <div className="preview-main">
        <div className="preview-breadcrumb">
          Biology
          <ChevronRight size={12} />
          <span>
            {tab === "notes"
              ? "Cell transport"
              : tab === "tasks"
                ? "This week"
                : "Quick review"}
          </span>
          <span className="preview-saved">
            {tab === "notes" ? "All changes saved" : "Example workspace"}
          </span>
        </div>
        <div
          className="preview-mobile-tabs"
          role="group"
          aria-label="Preview views"
        >
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "notes" && (
          <article className="preview-note">
            <div className="preview-note-icon">
              <FileText size={24} strokeWidth={1.5} />
            </div>
            <h2>Cell transport</h2>
            <p className="preview-note-meta">
              Biology <span>Lecture notes</span>
            </p>
            <p>
              Every cell is a small, busy world. Its membrane decides what comes
              in and what stays out.
            </p>
            <h3>Moving across the membrane</h3>
            <p>
              Substances move in two main ways. The difference comes down to
              energy.
            </p>
            <div className="preview-callout">
              <span className="preview-callout-mark">↳</span>
              <p>
                <strong>Passive transport</strong> follows the concentration
                gradient. No extra energy needed.
              </p>
            </div>
            <div className="preview-callout">
              <span className="preview-callout-mark">↗</span>
              <p>
                <strong>Active transport</strong> moves against the gradient and
                uses energy from ATP.
              </p>
            </div>
            <div className="preview-note-footer">
              <Plus size={13} />A question to revisit: why do root hair cells
              need active transport?
            </div>
          </article>
        )}
        {tab === "tasks" && (
          <article className="preview-note">
            <div className="preview-note-icon">
              <CheckSquare size={24} strokeWidth={1.5} />
            </div>
            <h2>A manageable week</h2>
            <p className="preview-note-meta">
              Biology <span>One thing at a time</span>
            </p>
            <p>
              A small, specific task is easier to begin. Here’s what’s next.
            </p>
            <button
              className={`preview-task ${completed ? "preview-task-done" : ""}`}
              aria-pressed={completed}
              onClick={() => setCompleted((value) => !value)}
            >
              <span className="preview-check">
                {completed && <Check size={13} />}
              </span>
              <span>
                Explain active transport in my own words
                <small>Cell biology · 15 minutes</small>
              </span>
            </button>
            <div className="preview-task">
              <span className="preview-check" />
              <span>
                Read the chapter on osmosis
                <small>Cell biology · 20 minutes</small>
              </span>
            </div>
            <p className="preview-inline-note">
              {completed
                ? "One less thing on your mind. Nice work."
                : "Try checking off the first task."}
            </p>
          </article>
        )}
        {tab === "review" && (
          <article className="preview-note">
            <div className="preview-note-icon">
              <Layers size={24} strokeWidth={1.5} />
            </div>
            <h2>A moment to remember</h2>
            <p className="preview-note-meta">
              Biology <span>Active recall</span>
            </p>
            <button
              className="preview-flashcard"
              onClick={() => setFlipped((value) => !value)}
              aria-label={flipped ? "Show question" : "Reveal answer"}
            >
              <small>{flipped ? "Answer" : "Question"}</small>
              <strong>
                {flipped
                  ? "Water moves across a partially permeable membrane, from a dilute solution to a more concentrated one."
                  : "What happens during osmosis?"}
              </strong>
              <span>
                {flipped
                  ? "Back to the question"
                  : "Think first, then reveal the answer"}
                <ArrowRight size={13} />
              </span>
            </button>
          </article>
        )}
      </div>
      <aside className="preview-context">
        <span className="preview-section-label">A good place to start</span>
        <h3>Keep it small.</h3>
        <p>Understand one concept before moving on to the next.</p>
        <div className="preview-context-rule" />
        <span className="preview-section-label">Connected to this note</span>
        <div className="preview-related">
          <Layers size={15} />
          <div>
            Cell transport<small>8 flashcards</small>
          </div>
        </div>
        <div className="preview-related">
          <CheckSquare size={15} />
          <div>
            Review this chapter<small>Study task</small>
          </div>
        </div>
        <span className="preview-handwritten">It all connects.</span>
      </aside>
    </div>
  );
}
