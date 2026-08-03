import type { Metadata } from "next";
import { Anton, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import "./magazine-type.css";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const condensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-condensed",
});

export const metadata: Metadata = {
  title: "Played For",
  description: "Guess the footballer from the clubs they played for.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${condensed.variable}`}>{children}</body>
    </html>
  );
}
