import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-cal",
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "iLeague - Connect with Influencers & Fans",
    template: "%s | iLeague",
  },
  description:
    "Join iLeague to connect with your favorite influencers, participate in leagues and competitions, and build your community.",
  keywords: [
    "influencer",
    "fan engagement",
    "community",
    "leagues",
    "competitions",
    "social platform",
  ],
  authors: [{ name: "iLeague" }],
  creator: "iLeague",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ileague.app",
    title: "iLeague - Connect with Influencers & Fans",
    description:
      "Join iLeague to connect with your favorite influencers, participate in leagues and competitions, and build your community.",
    siteName: "iLeague",
  },
  twitter: {
    card: "summary_large_image",
    title: "iLeague - Connect with Influencers & Fans",
    description:
      "Join iLeague to connect with your favorite influencers, participate in leagues and competitions, and build your community.",
    creator: "@ileagueapp",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
