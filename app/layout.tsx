import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import Script from "next/script";
import GDPRBanner from "@/components/GDPRBanner";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartRead — Tu lector inteligente",
  description:
    "Lee PDFs, EPUBs y TXTs con traducción instantánea integrada. El lector perfecto para estudiantes que quieren leer más rápido y entender mejor.",
  keywords: ["lector PDF", "lector EPUB", "traducción", "estudiantes", "SmartRead", "leer online"],
  authors: [{ name: "SmartRead" }],
  openGraph: {
    title: "SmartRead — Tu lector inteligente",
    description:
      "Lee PDFs, EPUBs y TXTs con traducción instantánea. Lee más rápido. Entiende mejor.",
    type: "website",
    locale: "es_ES",
    siteName: "SmartRead",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartRead — Tu lector inteligente",
    description: "Lee PDFs, EPUBs y TXTs con traducción instantánea integrada.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || "pub-XXXXXXXXXXXXXX";

  return (
    <html lang="es" className={`${inter.variable} ${lora.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        {children}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <GDPRBanner />
      </body>
    </html>
  );
}
