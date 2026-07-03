import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { ExamCategories } from "@/components/landing/exam-categories";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="page-wrapper">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ExamCategories />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
