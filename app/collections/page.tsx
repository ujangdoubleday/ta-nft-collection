import { Container } from "@/components/ui/container";
import { CollectionGallery } from "@/components/features/collections";

export default function MyCollectionsPage() {
  return (
    <main className="py-4">
      <Container>
        <CollectionGallery />
      </Container>
    </main>
  );
}
