import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import Script from "next/script";
import { cookies } from "next/headers";
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

const BASE_URL = "https://smart-read-rouge.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SmartRead — Lector PDF, EPUB y TXT con traducción instantánea",
    template: "%s — SmartRead",
  },
  description:
    "SmartRead: lee PDFs, EPUBs y TXTs directamente en tu navegador con traducción instantánea en 8 idiomas. Gratis, privado y sin instalaciones. Ideal para estudiantes.",
  keywords: [
    "lector PDF online gratis",
    "lector EPUB online",
    "lector TXT",
    "traducción instantánea",
    "leer PDF sin descargar",
    "SmartRead",
    "traductor de libros",
    "estudiantes idiomas",
    "reader online",
    "leer EPUB en el navegador",
  ],
  authors: [{ name: "SmartRead", url: BASE_URL }],
  creator: "SmartRead",
  publisher: "SmartRead",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "SmartRead — Lector inteligente con traducción instantánea",
    description:
      "Lee PDFs, EPUBs y TXTs con traducción instantánea. Gratis, privado, sin instalaciones.",
    url: BASE_URL,
    type: "website",
    locale: "es_ES",
    siteName: "SmartRead",
    // og:image provided by app/opengraph-image.tsx (generated, no missing asset)
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartRead — Lee más rápido. Entiende mejor.",
    description: "Lector web gratuito para PDF, EPUB y TXT con traducción instantánea en 8 idiomas.",
    // twitter:image provided by app/twitter-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: "education",
};

// Allow pinch-zoom — required for WCAG accessibility + AdSense policy
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SmartRead",
  url: BASE_URL,
  description: "Lector web gratuito para PDF, EPUB y TXT con traducción instantánea integrada.",
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  featureList: [
    "Leer PDF en el navegador",
    "Leer EPUB en el navegador",
    "Traducción instantánea de texto",
    "Almacenamiento en la nube",
    "100% privado",
    "Sin instalaciones",
  ],
  inLanguage: ["es", "en", "it", "fr", "de", "pt", "ja", "zh"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const hasValidAdsense = adsenseId && !adsenseId.includes("XXXXX");

  const cookieStore = await cookies();
  const consent = cookieStore.get("gdpr_consent")?.value;
  const hasAdsConsent = consent === "accepted";

  return (
    <html lang="es" className={`${inter.variable} ${lora.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to ad networks only with consent — handled client-side */}
      </head>
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        {children}

        {/* AdSense — only load if consent given AND valid publisher ID */}
        {hasAdsConsent && hasValidAdsense && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        <GDPRBanner />
      </body>
    </html>
  );
}
