import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const title = "EchoCal — one-way calendar mirrors";
const description =
  "One-way Google Calendar mirrors, with provenance. Mirror work and personal calendars onto a dedicated target with privacy modes and encrypted tokens. No extension.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s · EchoCal",
  },
  description,
  metadataBase: new URL("https://calagg.vercel.app"),
  verification: {
    google: "C0EJt9fXagagALpr0S9QCPiq1iBeefctF7shifDVE",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: "https://calagg.vercel.app",
    siteName: "EchoCal",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
