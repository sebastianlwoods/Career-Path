import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Path",
  description: "Guess the footballer from their clubs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
