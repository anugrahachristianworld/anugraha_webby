import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { Suspense } from "react";

// ✅ Update this once your domain is live
const BASE_URL = "https://www.anugrahachristianworld.in";

export const metadata: Metadata = {
  // ✅ metadataBase makes all relative image URLs absolute in OG/Twitter tags
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Anugraha Christian World | Christian Articles Store – Hyderabad",
    template: "%s | Anugraha Christian World",
  },
  description:
    "Anugraha Christian World — Telangana & Andhra's largest Christian articles store in Secundrabad, Hyderabad. Shop devotional statues, chalices, crosses, candle stands, rosaries and more.",
  keywords: [
    "Christian articles store Hyderabad",
    "devotional items Telangana",
    "Christian gifts Secundrabad",
    "chalice India",
    "religious articles Hyderabad",
    "Christian statues",
    "rosary beads India",
    "church supplies Hyderabad",
    "Anugraha Christian World",
    "Mettuguda Christian shop",
  ],
  authors: [{ name: "Anugraha Christian World", url: BASE_URL }],
  creator: "Anugraha Christian World",
  publisher: "Anugraha Christian World",

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

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Anugraha Christian World",
    title: "Anugraha Christian World | Christian Articles Store – Hyderabad",
    description:
      "Telangana & Andhra's largest Christian articles store. Devotional statues, chalices, crosses, candle stands & more — near St Anthony's Shrine, Mettuguda.",
    images: [
      {
        // ✅ Create a 1200×630 image at /public/images/og-image.jpg
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Anugraha Christian World – Christian Articles Store Hyderabad",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Anugraha Christian World | Christian Articles – Hyderabad",
    description:
      "Telangana & Andhra's largest Christian articles store. Statues, chalices, crosses & more.",
    images: ["/images/og-image.jpg"],
  },

  alternates: {
    canonical: BASE_URL,
  },

  icons: {
    icon: "/images/logo.svg",
    apple: "/apple-touch-icon.png",   // ✅ Add a 180×180 PNG at /public/apple-touch-icon.png
  },

  // ✅ Uncomment after verifying with Google Search Console
  // verification: { google: "YOUR_VERIFICATION_CODE" },
};

// ✅ JSON-LD: LocalBusiness structured data — helps Google show rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": BASE_URL,
  name: "Anugraha Christian World",
  description:
    "Telangana and Andhra's largest Christian articles store near St Anthony's Shrine, Mettuguda, Secundrabad.",
  url: BASE_URL,
  telephone: ["+91-9912888606", "+91-9848587301"],
  email: "anugrahachristianworld@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "12-7-295, Shop No. 1, Beside St. Antony's Shrine, Mettuguda",
    addressLocality: "Secundrabad",
    addressRegion: "Telangana",
    postalCode: "500017",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 17.43495,
    longitude: 78.51729,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "20:00",
    },
  ],
  image: `${BASE_URL}/images/og-image.jpg`,
  priceRange: "₹₹",
  hasMap: "https://maps.google.com/?q=Anugraha+Christian+World+Mettuguda",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense>
      <html lang="en">
        <head>
          {/* ✅ Inject JSON-LD structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="min-h-screen bg-base-100 text-base-content flex flex-col">
          <Navbar />
          <ThemeToggle />
          <WhatsAppFAB />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </Suspense>
  );
}