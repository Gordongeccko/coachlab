import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "CoachLab",
  description: "Train smarter. Coach better.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-surface-1 text-ink-primary min-h-screen">
        <Navbar />
        <main className="pt-16">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
