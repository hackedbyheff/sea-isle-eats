import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { BRAND_NAME, PLATFORM_DOMAIN } from "@/lib/config";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const description =
  "Local dining guides — who's open, who takes cards, and where to order direct from the restaurant. A community guide, not an ordering platform.";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${PLATFORM_DOMAIN}`),
  title: {
    default: `${BRAND_NAME} — local dining guides`,
    template: `%s — ${BRAND_NAME}`,
  },
  description,
  applicationName: BRAND_NAME,
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
