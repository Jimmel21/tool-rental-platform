import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ClientProviders } from "@/components/providers/ClientProviders";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0358A7",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolrental.tt";

export const metadata: Metadata = {
  title: {
    default: "Tool Rental TT — Trinidad & Tobago",
    template: "%s | Tool Rental TT",
  },
  description: "Rent equipment and tools in Trinidad & Tobago. Browse and book online. Pick up or delivery.",
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Tool Rental TT" },
  formatDetection: { telephone: true, email: true },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "en_TT",
    url: siteUrl,
    siteName: "Tool Rental TT",
    title: "Tool Rental TT — Rent Tools in Trinidad & Tobago",
    description: "Rent equipment and tools in Trinidad & Tobago. Browse and book online.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tool Rental TT — Trinidad & Tobago",
    description: "Rent equipment and tools in Trinidad & Tobago. Browse and book online.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
