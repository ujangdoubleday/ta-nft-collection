import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Win98Window } from "@/components/ui/win98";

// Sample collection data
const collections = [
  {
    id: "pixel-art",
    name: "Pixel Art",
    description:
      "Classic pixel art celebrating the golden age of digital creativity",
    count: 16,
    thumbnail: "/assets/images/nfts/pixel-art/pixel-1.svg",
  },
  {
    id: "3d-voxel",
    name: "3D Voxel",
    description: "Three-dimensional voxel art with depth and personality",
    count: 8,
    thumbnail: "/assets/images/nfts/3d-voxel/voxel-1.svg",
  },
  {
    id: "retro-computing",
    name: "Retro Computing",
    description: "Digital artifacts celebrating the history of computing",
    count: 12,
    thumbnail: "/assets/images/nfts/retro-computing/retro-1.svg",
  },
  {
    id: "windows-98-icons",
    name: "Classic Icons",
    description:
      "Nostalgic digital iconography from the dawn of the internet age",
    count: 24,
    thumbnail: "/assets/images/nfts/windows-98-icons/win98-1.svg",
  },
];

export default function MyCollectionsPage() {
  return (
    <main className="py-4">
      <Container>
        <Win98Window
          title="Your Digital Gallery"
          icon="/assets/icons/gallery.png"
          className="mb-4"
        >
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
                <Win98Window
                  key={collection.id}
                  title={collection.name}
                  className="overflow-hidden"
                >
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
                </Win98Window>
              ))}
            </div>
          )}
        </Win98Window>
      </Container>
    </main>
  );
}
