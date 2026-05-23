import type { Metadata } from "next";
import AboutSection from "@/components/AboutSection";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Anugraha Christian World — our mission to bring sacredness into every Christian home with devotional items, handcrafted statues, church supplies, and customized Christian articles.",
  openGraph: {
    title: "About Anugraha Christian World",
    description:
      "Our mission: to bring sacredness into every Christian home. Serving the community since 2004 near St Anthony's Shrine, Mettuguda.",
    images: [
      {
        url: "/biju.jpg",   // or /images/og-image.jpg
        width: 800,
        height: 600,
        alt: "Biju George, founder of Anugraha Christian World",
      },
    ],
  },
  alternates: { canonical: "https://www.anugrahachristianworld.in/about" },
};

export default function AboutPage() {
  return (
    <main>
      <AboutSection />
    </main>
  );
}