"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Win98Window } from "@/components/ui/win98";
import { FileUp } from "lucide-react";

// Define types for the collection items
type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  attributes: {
    rarity?: string;
    pixels?: string;
    dimensions?: string;
    complexity?: string;
    era?: string;
    style?: string;
    category?: string;
    resolution?: string;
  };
};

type Collection = {
  name: string;
  description: string;
  items: CollectionItem[];
};

// Sample collections data
const collections: Record<string, Collection> = {
  "pixel-art": {
    name: "Pixel Art",
    description:
      "Classic pixel art celebrating the golden age of digital creativity",
    items: Array.from({ length: 12 }, (_, i) => ({
      id: `pixel-${i + 1}`,
      name: `Pixel Art #${i + 1}`,
      type: "Digital Art",
      image:
        i % 2 === 0
          ? "/assets/images/nfts/pixel-art/pixel-1.jpg"
          : "/assets/images/nfts/pixel-art/pixel-2.jpg",
      attributes: {
        rarity: i < 3 ? "Rare" : i < 8 ? "Uncommon" : "Common",
        pixels: `${(i + 1) * 8}x${(i + 1) * 8}`,
      },
    })),
  },
  "3d-voxel": {
    name: "3D Voxel",
    description: "Three-dimensional voxel art with depth and personality",
    items: Array.from({ length: 8 }, (_, i) => ({
      id: `voxel-${i + 1}`,
      name: `Voxel Art #${i + 1}`,
      type: "3D Model",
      image:
        i % 2 === 0
          ? "/assets/images/nfts/3d-voxel/voxel-1.svg"
          : "/assets/images/nfts/3d-voxel/voxel-2.svg",
      attributes: {
        dimensions: `${16 + i * 8}x${16 + i * 8}x${16 + i * 8}`,
        complexity: i < 2 ? "High" : i < 5 ? "Medium" : "Low",
      },
    })),
  },
  "retro-computing": {
    name: "Retro Computing",
    description: "Digital artifacts celebrating the history of computing",
    items: Array.from({ length: 10 }, (_, i) => ({
      id: `retro-${i + 1}`,
      name: `Retro Computer #${i + 1}`,
      type: "Digital Art",
      image:
        i % 2 === 0
          ? "/assets/images/nfts/retro-computing/retro-1.svg"
          : "/assets/images/nfts/retro-computing/retro-2.svg",
      attributes: {
        era: i < 3 ? "1970s" : i < 7 ? "1980s" : "1990s",
        style: i % 2 === 0 ? "Realistic" : "Stylized",
      },
    })),
  },
  "windows-98-icons": {
    name: "Classic Icons",
    description:
      "Nostalgic digital iconography from the dawn of the internet age",
    items: Array.from({ length: 16 }, (_, i) => ({
      id: `icon-${i + 1}`,
      name: `Classic Icon #${i + 1}`,
      type: "Icon Pack",
      image:
        i % 2 === 0
          ? "/assets/images/nfts/windows-98-icons/win98-1.svg"
          : "/assets/images/nfts/windows-98-icons/win98-2.svg",
      attributes: {
        category:
          i < 4
            ? "System"
            : i < 8
            ? "Application"
            : i < 12
            ? "Document"
            : "Misc",
        resolution: i % 3 === 0 ? "16x16" : i % 3 === 1 ? "32x32" : "48x48",
      },
    })),
  },
};

// Type for unwrapped params
type RouteParams = {
  collectionId: string;
};

export default function CollectionPage({ params }: { params: RouteParams }) {
  const router = useRouter();
  // Use any as a workaround for the type issues with React.use()
  const unwrappedParams = use(params as any) as RouteParams;
  const collectionId = unwrappedParams.collectionId;
  const collection = collections[collectionId as keyof typeof collections];

  const handleAddNewClick = () => {
    router.push(`/collections/${collectionId}/mint`);
  };

  const handleViewDetails = (itemId: string) => {
    router.push(`/collections/${collectionId}/${itemId}`);
  };

  // Handle case where collection doesn't exist
  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <Win98Window
            title="Error - Collection Not Found"
            className="max-w-4xl mx-auto"
            onClose={() => router.push("/collections")}
            icon="/assets/icons/windows.png"
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
        <Win98Window
          title={`Collection: ${collection.name}`}
          className="max-w-6xl mx-auto"
          icon="/assets/icons/windows.png"
        >
          <div className="p-4">
            <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-3 bg-white mb-4">
              <p className="text-black text-sm">{collection.description}</p>
            </div>

            {collection.items.length === 0 ? (
              <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-6 bg-white text-center">
                <p className="text-black text-sm mb-3">
                  This collection is empty. Start creating your digital artwork!
                </p>
                <Button
                  className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                  onClick={handleAddNewClick}
                >
                  Create Your First Artwork
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collection.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 hover:shadow-md"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-black text-sm font-bold truncate pr-2">
                        {item.name}
                      </div>
                    </div>

                    <div
                      className="bg-white mb-2 cursor-pointer overflow-hidden relative transition-all duration-200 hover:opacity-90 hover:shadow-md"
                      style={{
                        aspectRatio: "1/1",
                        width: "100%",
                      }}
                      onClick={() => handleViewDetails(item.id)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs opacity-0 hover:opacity-100 transition-opacity">
                        View Details
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <div className="text-black text-xs bg-[#efefef] px-1 border border-[#808080] rounded-sm">
                        {item.attributes?.rarity ||
                          item.attributes?.era ||
                          item.attributes?.complexity ||
                          ""}
                      </div>
                      <div className="text-black text-xs">Created by: You</div>
                    </div>

                    <div className="border border-[#808080] bg-[#f0f0f0] p-1 mb-2 text-[10px]">
                      {item.attributes &&
                        Object.entries(item.attributes).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-bold">{key}:</span>
                            <span>{value as string}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end mt-4">
              <Button
                className="flex items-center hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                onClick={handleAddNewClick}
              >
                <FileUp className="h-4 w-4 mr-1" />
                Add New NFT
              </Button>
            </div>
          </div>
        </Win98Window>
      </Container>
    </main>
  );
}
