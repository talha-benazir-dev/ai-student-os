import type { Metadata } from "next";
import Link from "next/link";
import { NucleusMark } from "@/components/nucleus-mark";
import { LoginForm } from "@/features/auth/components/login-form";
import { redirectIfAuthenticated } from "@/features/auth/lib/redirect-if-authenticated";

export const metadata: Metadata = {
  title: "Login — Nucleus",
  description: "Login to your Nucleus account.",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-0 bg-background relative overflow-hidden">
      <Link href="/" className="mb-8 flex items-center gap-2.5 text-xl font-medium tracking-tight"><NucleusMark />Nucleus</Link>
      <div className="z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
