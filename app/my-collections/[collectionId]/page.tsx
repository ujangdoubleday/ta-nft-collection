import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Sample collections data
const collections = {
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
          ? "/images/nfts/pixel-art/pixel-1.svg"
          : "/images/nfts/pixel-art/pixel-2.svg",
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
          ? "/images/nfts/3d-voxel/voxel-1.svg"
          : "/images/nfts/3d-voxel/voxel-2.svg",
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
          ? "/images/nfts/retro-computing/retro-1.svg"
          : "/images/nfts/retro-computing/retro-2.svg",
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
          ? "/images/nfts/windows-98-icons/win98-1.svg"
          : "/images/nfts/windows-98-icons/win98-2.svg",
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

export default function CollectionPage({
  params,
}: {
  params: { collectionId: string };
}) {
  const collectionId = params.collectionId;
  const collection = collections[collectionId as keyof typeof collections];

  // Handle case where collection doesn't exist
  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
            <div className="win98-bar h-6 flex items-center px-2 mb-4">
              <span className="text-white text-xs font-semibold tracking-tight">
                Collection Not Found
              </span>
            </div>
            <div className="text-black p-3">
              <p>The collection you're looking for doesn't exist.</p>
              <Link href="/my-collections">
                <Button className="mt-4">Back to Your Gallery</Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-4">
      <Container>
        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4 mb-4">
          <div className="win98-bar h-6 flex items-center justify-between px-2 mb-2">
            <span className="text-white text-xs font-semibold tracking-tight">
              Collection: {collection.name}
            </span>
            <Link href={`/my-collections/${collectionId}/mint`}>
              <Button size="sm" className="text-xs h-5 py-0 px-2 bg-[#c0c0c0]">
                Add New Artwork
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link href="/my-collections">
                <Button size="sm" className="text-xs h-6 py-0 px-2 mr-2">
                  ← Back to Gallery
                </Button>
              </Link>
              <p className="text-black text-xs">{collection.description}</p>
            </div>
          </div>

          {collection.items.length === 0 ? (
            <div className="win98-shadow-inset p-6 bg-white text-center">
              <p className="text-black text-sm mb-3">
                This collection is empty. Start creating your digital artwork!
              </p>
              <Link href={`/my-collections/${collectionId}/mint`}>
                <Button>Create Your First Artwork</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collection.items.map((item) => (
                <Card key={item.id} className="h-full">
                  <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-black text-sm">
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="win98-shadow-inset h-32 w-full bg-white mb-2 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-28 max-w-28"
                      />
                    </div>
                    <div className="text-black text-xs">{item.type}</div>
                  </CardContent>
                  <CardFooter className="p-2 flex justify-between">
                    <div className="text-black text-xs">Creator: You</div>
                    <Link href={`/my-collections/${collectionId}/${item.id}`}>
                      <Button size="sm" className="text-xs h-6 py-0 px-2">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
