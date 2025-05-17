import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

// Sample collection data
const collections = [
  {
    id: "pixel-art",
    name: "Pixel Art",
    description:
      "Classic pixel art celebrating the golden age of digital creativity",
    count: 16,
    thumbnail: "/images/nfts/pixel-art/pixel-1.svg",
  },
  {
    id: "3d-voxel",
    name: "3D Voxel",
    description: "Three-dimensional voxel art with depth and personality",
    count: 8,
    thumbnail: "/images/nfts/3d-voxel/voxel-1.svg",
  },
  {
    id: "retro-computing",
    name: "Retro Computing",
    description: "Digital artifacts celebrating the history of computing",
    count: 12,
    thumbnail: "/images/nfts/retro-computing/retro-1.svg",
  },
  {
    id: "windows-98-icons",
    name: "Classic Icons",
    description:
      "Nostalgic digital iconography from the dawn of the internet age",
    count: 24,
    thumbnail: "/images/nfts/windows-98-icons/win98-1.svg",
  },
];

export default function MyCollectionsPage() {
  return (
    <main className="py-4">
      <Container>
        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4 mb-4">
          <div className="win98-bar h-6 flex items-center justify-between px-2 mb-4">
            <span className="text-white text-xs font-semibold tracking-tight">
              Your Digital Gallery
            </span>
            <Link href="/my-collections/create">
              <Button size="sm" className="text-xs h-5 py-0 px-2 bg-[#c0c0c0]">
                Create New
              </Button>
            </Link>
          </div>

          {collections.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-black text-sm mb-4">
                Your gallery is empty. Start your creative journey today!
              </p>
              <Link href="/my-collections/create">
                <Button>Create Your First Collection</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] overflow-hidden"
                >
                  <div className="win98-bar h-6 flex items-center px-2">
                    <span className="text-white text-xs font-semibold tracking-tight">
                      {collection.name}
                    </span>
                  </div>

                  <div className="p-3 flex gap-3">
                    <div className="win98-shadow-inset h-20 w-20 bg-white flex-shrink-0 flex items-center justify-center">
                      <img
                        src={collection.thumbnail}
                        alt={collection.name}
                        className="max-h-16 max-w-16"
                      />
                    </div>
                    <div className="text-black">
                      <p className="text-xs mb-1">{collection.description}</p>
                      <p className="text-xs mb-2">
                        <strong>Items:</strong> {collection.count}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/my-collections/${collection.id}`}>
                          <Button size="sm" className="text-xs h-6 py-0 px-2">
                            View Gallery
                          </Button>
                        </Link>
                        <Link href={`/my-collections/${collection.id}/mint`}>
                          <Button size="sm" className="text-xs h-6 py-0 px-2">
                            Create New
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
