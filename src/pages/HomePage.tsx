import HeroSection from '../components/HeroSection';
import ValuePillars from '../components/ValuePillars';
import ComparisonTable from '../components/ComparisonTable';
import PortfolioSection from '../components/PortfolioSection';
import ProcessSection from '../components/ProcessSection';
import BenefitsSection from '../components/BenefitsSection';
import PricingSection from '../components/PricingSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValuePillars />
      <ComparisonTable />
      <PortfolioSection />
      <ProcessSection />
      <BenefitsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}
