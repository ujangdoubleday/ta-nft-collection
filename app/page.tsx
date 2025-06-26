import { Container } from '@/components/core/layout/container';
import { HeroSection } from '@/components/features/home';

export default function Home() {
  return (
    <main className="py-4">
      <Container>
        <HeroSection />
      </Container>
    </main>
  );
}
