import { Container } from '@/components/core/layout/container';
import { ContactInfo, ContactForm, SocialConnect } from '@/components/features/contact';

export default function ContactPage() {
  return (
    <main className="py-4">
      <Container>
        <ContactInfo />
        <ContactForm />
        <SocialConnect />
      </Container>
    </main>
  );
}
