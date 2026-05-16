import { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  CheckSquare,
  Sparkles,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nucleus — Study OS",
  description: "Your AI study operating system.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-violet flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold">Nucleus</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-[#7c5cfc] hover:bg-[#6a4ce8] rounded-lg transition"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your AI Study Operating System
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Nucleus helps you study smarter with AI-powered notes, tasks,
            documents, and memory management—all in one place.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-[#7c5cfc] hover:bg-[#6a4ce8] rounded-lg transition hover:scale-105"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Everything you need to study effectively
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Powerful tools designed to help you learn faster and remember more
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={FileText}
              title="Notes"
              description="Capture and organize your thoughts with AI-powered summaries"
            />
            <FeatureCard
              icon={CheckSquare}
              title="Tasks"
              description="Track assignments and deadlines with smart reminders"
            />
            <FeatureCard
              icon={FileText}
              title="Documents"
              description="Upload PDFs and get instant AI insights and summaries"
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Memory"
              description="Your personal AI that learns and adapts to your study patterns"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-violet flex items-center justify-center">
              <BrainCircuit className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium">Nucleus</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Nucleus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card hover:border-[#7c5cfc]/50 transition group">
      <div className="h-12 w-12 rounded-lg bg-[#7c5cfc]/10 flex items-center justify-center mb-4 group-hover:bg-[#7c5cfc]/20 transition">
        <Icon className="h-6 w-6 text-[#7c5cfc]" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
