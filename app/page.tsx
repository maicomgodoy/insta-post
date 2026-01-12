import HeroSection from './landing/components/HeroSection'
import BenefitsSection from './landing/components/BenefitsSection'
import HowItWorksSection from './landing/components/HowItWorksSection'
import FeaturesSection from './landing/components/FeaturesSection'
import PricingPreviewSection from './landing/components/PricingPreviewSection'
import CTASection from './landing/components/CTASection'
import Footer from './landing/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingPreviewSection />
      <CTASection />
      <Footer />
    </div>
  )
}
