import Layout from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CarouselSection } from "@/components/home/CarouselSection";
import { BusinessCarousels } from "@/components/home/BusinessCarousels";
import { WebdevSection } from "@/components/home/WebdevSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { GetInTouchSection } from "@/components/home/GetInTouchSection";
import { useMetaTags } from "@/hooks/use-meta-tags";

export default function Home() {
  useMetaTags({
    title: "Hasanpur Connect — Discover Local Businesses in Hasanpur, UP",
    description: "Find the best local businesses, services, restaurants, doctors, and more in Hasanpur, Uttar Pradesh. Your trusted local business directory.",
  });

  return (
    <Layout>
      <Hero />
      <CarouselSection />
      <CategoryGrid />
      <BusinessCarousels />
      <WhyChooseUsSection />
      <GetInTouchSection />
      <WebdevSection />
    </Layout>
  );
}
