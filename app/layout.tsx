import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Instrument_Sans, JetBrains_Mono, Inter, Outfit } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ThemeProvider from "@/components/site/ThemeProvider";
import { SITE } from "@/lib/site";

// Public site fonts
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--nf-serif",
  display: "swap",
});
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--nf-sans", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--nf-mono",
  display: "swap",
});

// Admin panel fonts — declared here but not preloaded, so public pages never download them.
const adminSans = Inter({ subsets: ["latin"], variable: "--nf-admin-sans", preload: false, display: "swap" });
const adminDisplay = Outfit({ subsets: ["latin"], variable: "--nf-admin-display", preload: false, display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: `${SITE.name} — Freelance Fullstack Developer in Mumbai`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    title: `${SITE.name} — Freelance Fullstack Developer`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f0eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable} ${adminSans.variable} ${adminDisplay.variable}`}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
