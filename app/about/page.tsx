import { Container } from '@/components/core/layout/container';
import { Welcome, Creator } from '@/components/features/about';

export default function AboutPage() {
  return (
    <main className="py-4">
      <Container>
        <Welcome />
        <Creator />
      </Container>
    </main>
  );
}
