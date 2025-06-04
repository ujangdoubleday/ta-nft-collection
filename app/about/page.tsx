import { Container } from '@/components/core/layout/container';
import { Welcome, Mission, Features, Creator } from '@/components/features/about';

export default function AboutPage() {
  return (
    <main className="py-4">
      <Container>
        <Welcome />
        <Mission />
        <Features />
        <Creator />
      </Container>
    </main>
  );
}
