import type { Metadata } from "next";
import React, { Suspense } from "react";
import ContactFormWrapper from "@/components/ContactFormWrapper";
import { MdCall } from "react-icons/md";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Anugraha Christian World. Visit us at Mettuguda, Secundrabad, Hyderabad, or call +91-9912888606. We're open Monday–Saturday, 9:30 AM – 8:00 PM.",
  openGraph: {
    title: "Contact Anugraha Christian World",
    description:
      "Visit us near St Anthony's Shrine, Mettuguda, Secundrabad. Call, WhatsApp or email us.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://www.anugrahachristianworld.in/contact" },
};

export default function ContactPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <section className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl rounded-xl">
              <ContactFormWrapper />
            </div>
          </div>
          <div className="w-full bg-secondary rounded-xl shadow-2xl p-6 transform transition-transform duration-500 hover:scale-[1.01]">
            <h1 className="text-4xl font-bold">Visit Us</h1>
            <div className="w-full h-84 overflow-hidden rounded-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.516980818246!2d78.51729407497386!3d17.43495298346039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9a2b456bcb8b%3A0x19b66be95c80bea9!2sAnugraha%20Christian%20World!5e0!3m2!1sen!2sin!4v1754473278003!5m2!1sen!2sin"
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                title="Anugraha Christian World location on Google Maps"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="tel:+91-9912888606"
                className="w-full my-4 flex items-center p-3 justify-center border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <MdCall className="h-5 w-5" />
                <span className="w-full text-center">Call Now</span>
              </a>
              <a
                href="mailto:anugrahachristianworld@gmail.com"
                className="w-full my-4 flex items-center p-3 justify-center border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </Suspense>
  );
}