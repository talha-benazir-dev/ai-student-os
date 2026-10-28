import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  FileText,
  Layers,
  Timer,
} from "lucide-react";
import { NucleusMark } from "@/components/nucleus-mark";
import { WorkspacePreview } from "./workspace-preview";
import "../landing.css";

const tools = [
  {
    icon: FileText,
    title: "Give every idea a home",
    text: "Lecture notes, PDFs, diagrams, and loose thoughts. Keep them together by cluster so you can pick up where you left off.",
    detail: "Notes & documents",
  },
  {
    icon: Timer,
    title: "Make the next step smaller",
    text: "Turn a chapter into a manageable task. Start a focus session and give one thing your attention.",
    detail: "Tasks & focus sessions",
  },
  {
    icon: Layers,
    title: "Come back to what matters",
    text: "Write a question, try to recall the answer, then review it again when it’s due. Build understanding over time.",
    detail: "Flashcards & spaced repetition",
  },
];

export function LandingPage() {
  return (
    <div className="study-landing">
      <a href="#main-content" className="landing-skip">
        Skip to content
      </a>
      <header className="landing-header">
        <Link href="/" aria-label="Nucleus home" className="landing-wordmark">
          <NucleusMark />
          Nucleus
        </Link>
        <nav aria-label="Main navigation" className="landing-nav">
          <a href="#workspace">Workspace</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="landing-account">
          <Link href="/login">Log in</Link>
          <Link href="/signup" className="landing-button landing-button-small">
            Get started
          </Link>
        </div>
      </header>
      <main id="main-content">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <h1>
              A little structure.
              <br />A lot more headspace.
            </h1>
            <div className="landing-hero-aside">
              <p>
                One considered space for everything you’re learning. Gather your
                notes, find your next step, and make room to understand.
              </p>
              <Link href="/signup" className="landing-button">
                Create your workspace
                <ArrowUpRight size={16} />
              </Link>
              <span className="landing-fine-print">
                Free to start. Yours to make sense of.
              </span>
            </div>
          </div>
          <div id="workspace" className="landing-product-frame">
            <WorkspacePreview />
          </div>
          <div className="landing-product-caption">
            <span>Your clusters. Your pace. One place.</span>
            <span>An interactive look inside Nucleus</span>
          </div>
        </section>
        <section id="how-it-works" className="landing-tools">
          <div className="landing-section-heading">
            <h2>
              From “where do I start?”
              <br />
              to one thing at a time.
            </h2>
            <p>
              You don’t need a perfect system. Just a place to collect what you
              know, work on what’s next, and revisit what you’re learning.
            </p>
          </div>
          <div className="landing-tool-grid">
            {tools.map(({ icon: Icon, title, text, detail }) => (
              <article key={title}>
                <Icon size={23} strokeWidth={1.5} />
                <h3>{title}</h3>
                <p>{text}</p>
                <span>{detail}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-assistant" id="assistant">
          <div>
            <BookOpen size={26} strokeWidth={1.5} />
            <h2>
              A study partner,
              <br />
              when you need one.
            </h2>
            <p>
              Ask a question about your material, work through a difficult
              concept, or turn a document into a study pack. Your notes stay at
              the center of the conversation.
            </p>
            <p className="landing-small-note">
              AI assistance is available with Nucleus Pro.
            </p>
          </div>
          <div
            className="landing-conversation"
            aria-label="Example study conversation"
          >
            <span className="landing-conversation-label">
              Biology / Cell transport
            </span>
            <p className="landing-question">
              I can define osmosis, but how is it different from diffusion?
            </p>
            <div className="landing-answer">
              <NucleusMark className="size-5" />
              <div>
                <p>
                  Start with the bigger idea: diffusion is the movement of
                  particles from a higher to a lower concentration.
                </p>
                <p>
                  Osmosis is a specific case: water moving across a partially
                  permeable membrane.
                </p>
                <strong>
                  Try explaining what happens to a raisin left in water.
                </strong>
              </div>
            </div>
            <span className="landing-example-label">
              Illustrative conversation
            </span>
          </div>
        </section>
        <section id="pricing" className="landing-pricing">
          <div className="landing-section-heading">
            <h2>
              Start with the essentials.
              <br />
              Grow from there.
            </h2>
            <p>
              A useful workspace from day one, with extra support available when
              you need it.
            </p>
          </div>
          <div className="landing-price-grid">
            <article>
              <div className="landing-price-title">
                <h3>Free</h3>
                <span>For your everyday studying</span>
              </div>
              <p className="landing-price">
                $0<span> / forever</span>
              </p>
              <ul>
                {[
                  "Notes, tasks, and flashcards",
                  "Clusters to keep things connected",
                  "5 document uploads per month",
                  "Focus sessions and study analytics",
                ].map((item) => (
                  <li key={item}>
                    <Check size={15} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="landing-button landing-button-outline"
              >
                Start for free
              </Link>
            </article>
            <article className="landing-price-pro">
              <div className="landing-price-title">
                <h3>Pro</h3>
                <span>A little more support</span>
              </div>
              <p className="landing-price">
                $8<span> / month</span>
              </p>
              <ul>
                {[
                  "Everything in Free",
                  "AI study workspace",
                  "Document summaries and study packs",
                  "AI flashcards and unlimited uploads",
                ].map((item) => (
                  <li key={item}>
                    <Check size={15} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=pro" className="landing-button">
                Explore Pro
              </Link>
            </article>
          </div>
        </section>
        <section className="landing-closing">
          <NucleusMark className="size-10" />
          <h2>Make space for your next idea.</h2>
          <p>
            A new cluster, a tricky chapter, a fresh start. Begin with one
            thing.
          </p>
          <Link href="/signup" className="landing-button">
            Create your workspace
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <Link href="/" className="landing-wordmark">
          <NucleusMark />
          Nucleus
        </Link>
        <p>A place to think things through.</p>
        <nav aria-label="Footer">
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link href="/login">Log in</Link>
        </nav>
      </footer>
    </div>
  );
}
