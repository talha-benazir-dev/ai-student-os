import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nucleus — Your AI Study OS",
    template: "%s",
  },
  description:
    "Nucleus is a calm, intelligent operating system for students. Notes, tasks, flashcards, PDFs and an AI assistant — in one workspace.",
  authors: [{ name: "Nucleus" }],
  openGraph: {
    title: "Nucleus — Your AI Study OS",
    description: "A premium AI-native study workspace.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@nucleus",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
