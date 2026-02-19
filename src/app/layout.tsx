import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://trydashdiet.com"),
  title: "DASH Diet Plan — Personalized for You",
  description:
    "Get your personalized DASH diet meal plan, exercise routine, and food combinations based on science. Lower blood pressure, lose weight, and feel amazing.",
  keywords: [
    "DASH diet",
    "diet plan",
    "meal plan",
    "blood pressure",
    "healthy eating",
    "weight loss",
    "exercise plan",
  ],
  icons: {
    icon: [
      { url: "/dash-diet-favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/dash-diet-favicon.svg",
  },
  openGraph: {
    title: "DASH Diet Plan — Personalized for You",
    description:
      "Get your personalized DASH diet meal plan and exercise routine based on science.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e3a5f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="max-w-md mx-auto min-h-screen relative">
          {children}
        </main>
        <CookieBanner />
      </body>
    </html>
  );
}
