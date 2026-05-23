import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about ordering, payment, shipping and contacting Anugraha Christian World.",
  alternates: { canonical: "https://www.anugrahachristianworld.in/faq" },
};

// ✅ Add FAQ JSON-LD structured data — Google can show these as rich results
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I place an order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Contact us through the Contact page on our website or call us at +91-9912888606.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Payment is done in store. We do not accept online payments through the website.",
      },
    },
    {
      "@type": "Question",
      name: "What is your shipping policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We can ship through services like Rapido. Contact us for shipping arrangements.",
      },
    },
    {
      "@type": "Question",
      name: "How can I contact customer support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can reach us through the Contact page, by phone at +91-9912888606, or by email at anugrahachristianworld@gmail.com.",
      },
    },
  ],
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container mx-auto p-8 md:p-12 lg:p-16 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-sm md:text-base text-center mb-12">
          We have got the answers to your most common questions right here.
        </p>
        <div className="space-y-8">
          <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2">How can I place an order?</h2>
            <p className="text-base md:text-lg">
              Contact us through the <Link href="/contact">Contact page</Link>.
            </p>
          </div>
          <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              What payment methods do you accept?
            </h2>
            <p className="text-base md:text-lg">
              There is no payment method through the website. Payment can be done in store.
            </p>
          </div>
          <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2">What is your shipping policy?</h2>
            <p className="text-base md:text-lg">We can ship through services like Rapido.</p>
          </div>
          <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              How can I contact customer support?
            </h2>
            <p className="text-base md:text-lg">
              You can reach us through the <Link href="/contact">Contact page</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}