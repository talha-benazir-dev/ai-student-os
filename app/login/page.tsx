import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login — Nucleus",
  description: "Login to your Nucleus account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-0 bg-background relative overflow-hidden">
      {/* Dynamic Background Glow matching landing page */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="mb-8 z-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Nucleus
        </h1>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
