import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Text to Cron - Convert Natural Language to Cron Expressions",
  description:
    "Convert natural language schedules to cron expressions and vice versa. Simple, fast, and free.",
  keywords: ["cron", "cron expression", "scheduler", "cron generator", "natural language"],
  authors: [{ name: "text-to-cron" }],
  openGraph: {
    title: "Text to Cron",
    description: "Convert natural language to cron expressions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
