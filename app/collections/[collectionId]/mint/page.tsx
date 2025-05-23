"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Win98Window } from "@/components/ui/win98";
import { NFTMintForm } from "@/components/features/collections";
import { useRouter } from "next/navigation";
import { use } from "react";

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

export default function CreateNFTPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { collectionId } = resolvedParams;

  // In a real app, this would be a database or API call
  const collection = collections[collectionId as keyof typeof collections];

  // Handle case where collection doesn't exist
  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <Win98Window
            title="Error - Collection Not Found"
            className="max-w-4xl mx-auto"
            onClose={() => router.push("/collections")}
            icon="/assets/icons/window/gallery-create.png"
          >
            <div className="p-4">
              <div className="flex items-center mb-4 p-3 border border-[#808080] bg-[#fffbf0]">
                <svg
                  className="w-8 h-8 mr-3 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-black">
                  The collection you're looking for doesn't exist.
                </p>
              </div>
              <Button
                className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                onClick={() => router.push("/collections")}
              >
                Back to Your Gallery
              </Button>
            </div>
          </Win98Window>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-4">
      <Container>
        <NFTMintForm
          collectionId={collectionId}
          collectionName={collection.name}
        />
      </Container>
    </main>
  );
}
