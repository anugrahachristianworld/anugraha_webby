import AboutSection from "@/components/AboutSection";
import EnquireButton from "@/components/EnquireButton";
import FeaturedCategories from "@/components/FeaturedCategories";
import HeroSection from "@/components/HeroSection";
import ProductList from "@/components/ProductList";
import Testimonials from "@/components/Testimonials";
import { Metadata } from "next";

export const metadata: Metadata = {
  // layout.tsx template produces:
  // "Home | Anugraha Christian World | Christian Articles Store – Hyderabad"
  // Use `title: { absolute: "..." }` to override the template on this page:
  title: {
    absolute: "Anugraha Christian World | Christian Articles Store – Hyderabad",
  },
  description:
    "Shop devotional statues, chalices, crosses, candle stands, rosaries and more at Anugraha Christian World — Telangana & Andhra's largest Christian articles store in Secundrabad, Hyderabad.",
  alternates: { canonical: "https://www.anugrahachristianworld.in" },
};

export default function HomePage() {
  return (
    <> 
    <div className="flex  flex-col">
        <HeroSection /> 
        <AboutSection />
        <FeaturedCategories />
        <Testimonials /> 
      
          <div className='w-full text-center'><h1 className='mx-auto'>Our Products</h1></div>
          <ProductList ActionButton={EnquireButton} ITEMS_PER_PAGE={12} />
    </div>
    </>
  );
}