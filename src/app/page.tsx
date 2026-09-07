import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import PromoBanner from "@/components/PromoBanner";
import RecommendedProducts from "@/components/RecommendedProducts";
import CraftSection from "@/components/CraftSection";
import DeliveryBadges from "@/components/DeliveryBadges";
import CommunityCarousel from "@/components/CommunityCarousel";
import SiteFooter from "@/components/SiteFooter";
import { getRecommendedProducts } from "@/lib/firestore-products";

export default async function Home() {
  const recommended = await getRecommendedProducts(3);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustStrip />
      <RecommendedProducts products={recommended} />

      <CraftSection />

      <section className="py-4">
        <PromoBanner />
      </section>

      <DeliveryBadges />
      <CommunityCarousel />
      <SiteFooter />
    </div>
  );
}
