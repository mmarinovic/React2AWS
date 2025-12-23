import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SupportedResources } from '@/components/landing/SupportedResources';
import { SyntaxExamples } from '@/components/landing/SyntaxExamples';
import { Features } from '@/components/landing/Features';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <SupportedResources />
      <SyntaxExamples />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
