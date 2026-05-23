import type { Metadata } from "next";
import { Suspense } from "react";
import ProductList from "@/components/ProductList";
import EnquireButton from "@/components/EnquireButton";

export const metadata: Metadata = {
  title: "Our Products",
  description:
    "Browse our full range of Christian articles — chalices, monstrances, statues of Jesus, Mary & saints, candle stands, rosaries, crosses and more. Available at our store in Hyderabad.",
  openGraph: {
    title: "Christian Articles – Anugraha Christian World",
    description:
      "Chalices, statues, crosses, candle stands, rosaries and more. Hyderabad's largest Christian articles store.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://www.anugrahachristianworld.in/products" },
};

export default async function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full text-center">
        <h1 className="mx-auto">Our Products</h1>
      </div>
      <ProductList ActionButton={EnquireButton} />
    </Suspense>
  );
}