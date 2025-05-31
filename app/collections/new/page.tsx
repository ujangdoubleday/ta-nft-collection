import { Container } from '@/components/core/layout/container';
import { CollectionForm } from '@/components/features/collections';

export default function CreateCollectionPage() {
  return (
    <main className="py-4">
      <Container>
        <CollectionForm />
      </Container>
    </main>
  );
}
