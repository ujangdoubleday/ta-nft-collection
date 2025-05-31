import { Container } from '@/components/core/layout/container';
import { HeroSection, CreatorsJourney, StartCreating } from '@/components/features/home';

export default function Home() {
  return (
    <main className="py-4">
      <Container>
        <HeroSection />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <CreatorsJourney />
          <StartCreating />
        </div>
      </Container>
    </main>
  );
}
