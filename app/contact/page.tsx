import { Container } from '@/components/core/layout/container';
import { ContactInfo, SocialConnect } from '@/components/features/contact';

export default function ContactPage() {
  return (
    <main className="py-4">
      <Container>
        <ContactInfo />
        <SocialConnect />
      </Container>
    </main>
  );
}
