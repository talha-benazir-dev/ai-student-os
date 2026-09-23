import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Check,
  FileText,
  Layers,
  Timer,
  Flame,
  BookOpen,
  Brain,
  CalendarCheck,
} from "lucide-react";
import { FlashDemo, Faq } from "@/features/landing/components/landing-client";

export const metadata: Metadata = {
  title: "Nucleus — Your AI Study OS",
  description:
    "Notes, tasks, flashcards, PDFs and an AI tutor in one calm workspace. Built for exam season.",
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[13px] text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Exam season build — spaced review is live
        </div>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">
          Turn the pile into a plan
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          Lectures, PDFs, and problem sets become tonight&apos;s three tasks,
          tomorrow&apos;s flashcards, and a streak you&apos;ll actually protect.
          One calm workspace for all of it.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Start studying free
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium"
          >
            See the dashboard
          </Link>
        </div>
        <p className="mt-4 text-[13px] text-muted-foreground">
          Free for notes and tasks · no card required
        </p>

        {/* Product mockup — the protagonist */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-4 sm:p-6 text-left">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="ml-3 text-xs text-muted-foreground">
              nucleus — tonight&apos;s plan
            </span>
          </div>
          <div className="grid md:grid-cols-[1fr_220px] gap-4 pt-4">
            <div className="space-y-2">
              <MockTask done title="Review Krebs cycle flashcards" detail="Biology · 20 cards" />
              <MockTask title="Problem set 4 — eigenvectors" detail="Math · 45 min" />
              <MockTask title="SN1 / SN2 mechanism drills" detail="Chemistry · 35 min" />
            </div>
            <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 120 120" className="h-20 w-20 -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round" strokeDasharray={326.7} strokeDashoffset={110} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
                  32:10
                </div>
              </div>
              <div>
                <div className="text-[13px] font-medium">Deep focus</div>
                <div className="text-xs text-muted-foreground">45-min block</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-success">
                  <Flame className="h-3 w-3" /> 7-day streak
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold tracking-tight tabular-nums">12,400</div>
            <div className="text-[13px] text-muted-foreground mt-1">students studying tonight</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight tabular-nums">1.2M</div>
            <div className="text-[13px] text-muted-foreground mt-1">cards reviewed this month</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight tabular-nums">94</div>
            <div className="text-[13px] text-muted-foreground mt-1">longest active streak, days</div>
          </div>
        </div>
      </section>

      {/* Study loop */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em]">
          The loop that makes memory stick
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
          Cramming feels productive and fails reliably. This is the boring
          version that works: capture, understand, retrieve — every day.
        </p>
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          <LoopCard
            n="01"
            icon={BookOpen}
            title="Capture"
            body="Drop in PDFs, lecture notes, problem sets. Everything lives in one library instead of eleven tabs."
          />
          <LoopCard
            n="02"
            icon={Brain}
            title="Understand"
            body="Ask the AI to explain from your materials. Summaries, mechanisms, and worked examples grounded in your sources."
          />
          <LoopCard
            n="03"
            icon={Layers}
            title="Retain"
            body="One click turns any explanation into flashcards. Spaced review schedules them before you forget."
          />
        </div>
      </section>

      {/* Interactive demo */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-6 py-24 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em]">
              Try a review right here
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              This is the actual interaction: see a question, attempt it from
              memory, then check. Retrieval before review is the whole trick —
              and it takes eleven seconds.
            </p>
            <ul className="mt-6 space-y-3">
              <DemoPoint icon={Timer} text="Eleven seconds per card, scheduled daily" />
              <DemoPoint icon={CalendarCheck} text="Due cards wait for you every morning" />
              <DemoPoint icon={Flame} text="Streaks protect the habit on tired days" />
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <FlashDemo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em]">
          Everything exam season needs
        </h2>
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <FeatureCard
            icon={FileText}
            title="A library that reads itself"
            body="Upload a PDF and get a summary, key terms, and a flashcard deck without lifting a finger. Three summaries ready is the default state, not the exception."
          />
          <FeatureCard
            icon={Timer}
            title="Focus blocks with a ring"
            body="Pick 25, 45, or 60 minutes. One subject, phone away, a quiet ring counting down. Your average session length becomes a number you can raise."
          />
          <FeatureCard
            icon={Sparkles}
            title="A tutor that quizzes first"
            body="The AI asks before it tells. Attempt the mechanism, then get the correction — because the attempt is where the learning happens."
          />
          <FeatureCard
            icon={Flame}
            title="Streaks worth protecting"
            body="A heatmap of every study day this term. Loss aversion does the motivational heavy lifting that willpower can't."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em]">
            Students, mid-semester
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            <Quote
              body="I stopped reorganizing my notes and started finishing them. The tonight's-plan thing sounds small until you've done it nine days straight."
              name="Maya R."
              detail="Biology, second year"
            />
            <Quote
              body="The quiz-first tutor annoyed me for a week. Then my orgo midterm came back and I understood why."
              name="Daniel K."
              detail="Chemistry, first year"
            />
            <Quote
              body="My streak is at 41 days. I open the app in the morning the way other people check the weather."
              name="Sofia L."
              detail="Law, third year"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em]">
          Start free, upgrade at finals
        </h2>
        <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-3xl">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm font-semibold">Starter</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">$0</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <PriceRow text="Unlimited notes and tasks" />
              <PriceRow text="50 AI messages a month" />
              <PriceRow text="Flashcards with spaced review" />
            </ul>
            <Link href="/dashboard" className="mt-6 block text-center rounded-md border border-border px-4 py-2 text-sm font-medium">
              Start free
            </Link>
          </div>
          <div className="rounded-xl border border-primary/40 bg-card p-6">
            <div className="text-sm font-semibold">Pro</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              $8<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <PriceRow text="Unlimited AI summaries and decks" />
              <PriceRow text="PDF library with quizzes" />
              <PriceRow text="Full analytics history" />
            </ul>
            <Link href="/dashboard" className="mt-6 block text-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Go Pro
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="text-3xl font-semibold tracking-[-0.02em]">
            Asked every September
          </h2>
          <div className="mt-6 rounded-xl border border-border bg-card px-5">
            <Faq />
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Finals are 63 days away. Tonight takes 2 hours.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start with three tasks and one focus block. Momentum does the rest.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Open your dashboard
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Nucleus</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Product</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Reviews</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Pricing</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/dashboard" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function MockTask({ title, detail, done }: { title: string; detail: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <span className={`flex h-5 w-5 items-center justify-center rounded border ${done ? "bg-primary border-primary text-primary-foreground" : "border-border text-transparent"}`}>
        <Check className="h-3 w-3" />
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

function LoopCard({ n, icon: Icon, title, body }: { n: string; icon: typeof Brain; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{n}</span>
      </div>
      <div className="text-[15px] font-semibold tracking-tight">{title}</div>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function DemoPoint({ icon: Icon, text }: { icon: typeof Timer; text: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0 text-foreground" />
      {text}
    </li>
  );
}

function FeatureCard({ icon: Icon, title, body }: { icon: typeof Timer; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent mb-4">
        <Icon className="h-4 w-4" />
      </span>
      <div className="text-[15px] font-semibold tracking-tight">{title}</div>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Quote({ body, name, detail }: { body: string; name: string; detail: string }) {
  return (
    <figure className="rounded-xl border border-border bg-card p-6 flex flex-col">
      <blockquote className="text-sm leading-relaxed flex-1">{body}</blockquote>
      <figcaption className="mt-4 text-[13px]">
        <div className="font-medium">{name}</div>
        <div className="text-muted-foreground">{detail}</div>
      </figcaption>
    </figure>
  );
}

function PriceRow({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-3.5 w-3.5 text-success shrink-0" />
      {text}
    </li>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-12 grid sm:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold">Nucleus</span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            The calm study OS for exam season.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={["Dashboard", "Notes", "Flashcards", "AI Workspace"]}
        />
        <FooterCol
          title="Study"
          links={["Focus timer", "Spaced review", "Analytics", "Documents"]}
        />
        <FooterCol title="Company" links={["Pricing", "Sign in", "Settings"]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-4 text-xs text-muted-foreground">
          Nucleus Study OS — built for students, tested at finals.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-[13px] font-medium mb-3">{title}</div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l}>
            <Link href="/dashboard" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
