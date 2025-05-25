import { Container } from "@/components/ui/container";
import {
  ClientNFTMintForm,
  CollectionErrorMessage,
} from "@/components/features/collections";

export const runtime = "edge";

// Sample collections data for header display
const collections = {
  "pixel-art": {
    name: "Pixel Art",
    description:
      "Classic pixel art celebrating the golden age of digital creativity",
  },
  "3d-voxel": {
    name: "3D Voxel",
    description: "Three-dimensional voxel art with depth and personality",
  },
  "retro-computing": {
    name: "Retro Computing",
    description: "Digital artifacts celebrating the history of computing",
  },
  "windows-98-icons": {
    name: "Classic Icons",
    description:
      "Nostalgic digital iconography from the dawn of the internet age",
  },
};

type Params = Promise<{ collectionId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CreateNFTPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  // Await the params
  const resolvedParams = await params;
  const { collectionId } = resolvedParams;

  // In a real app, this would be a database or API call
  const collection = collections[collectionId as keyof typeof collections];

  // Handle case where collection doesn't exist
  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <CollectionErrorMessage
            title="Error - Collection Not Found"
            icon="/assets/icons/window/gallery-create.png"
          />
        </Container>
      </main>
    );
  }

  return (
    <main className="py-4">
      <Container>
        <ClientNFTMintForm
          collectionId={collectionId}
          collectionName={collection.name}
        />
      </Container>
    </main>
  );
}
