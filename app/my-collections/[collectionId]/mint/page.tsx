import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function CreateArtworkPage({
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
        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
          <div className="win98-bar h-6 flex items-center px-2 mb-4">
            <span className="text-white text-xs font-semibold tracking-tight">
              Create New Artwork in {collection.name}
            </span>
          </div>

          <div className="flex items-center mb-4">
            <Link href={`/my-collections/${collectionId}`}>
              <Button size="sm" className="text-xs h-6 py-0 px-2 mr-2">
                ← Back to Collection
              </Button>
            </Link>
            <p className="text-black text-xs">
              Add a new digital artwork to this collection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-black text-xs block mb-1">
                    Artwork Title *
                  </label>
                  <Input placeholder="Enter artwork title" required />
                </div>

                <div>
                  <label className="text-black text-xs block mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-sm h-24"
                    placeholder="Tell the story behind your artwork"
                  ></textarea>
                </div>

                <div>
                  <label className="text-black text-xs block mb-1">
                    External URL
                  </label>
                  <Input placeholder="https://" />
                  <p className="text-xs text-[#808080] mt-1">
                    Link to additional content (optional)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-black text-xs block mb-1">
                  Artwork File *
                </label>
                <div className="win98-shadow-inset h-40 w-full bg-white p-2 flex flex-col items-center justify-center">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center mx-auto mb-2">
                      <span className="text-black text-2xl">+</span>
                    </div>
                    <p className="text-xs text-black">
                      Upload your digital artwork
                    </p>
                  </div>
                  <Button size="sm" className="text-xs">
                    Browse Files...
                  </Button>
                </div>
                <p className="text-xs text-[#808080] mt-1">
                  Supported formats: PNG, JPG, GIF, MP4 (max 30MB)
                </p>
              </div>

              <div>
                <label className="text-black text-xs block mb-1">
                  Properties
                </label>
                <div className="win98-shadow-inset p-2 bg-white">
                  <div className="flex mb-2">
                    <Input placeholder="Property name" className="mr-2" />
                    <Input placeholder="Value" />
                  </div>
                  <div className="flex mb-2">
                    <Input placeholder="Property name" className="mr-2" />
                    <Input placeholder="Value" />
                  </div>
                  <Button size="sm" className="w-full text-xs mt-1">
                    + Add Property
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="win98-shadow-inset mt-6 p-3 bg-white">
            <p className="text-xs mb-2">
              <strong>Note:</strong> Creating digital artwork will preserve your
              creative rights and store it securely in your collection.
            </p>
          </div>

          <div className="flex justify-between mt-6">
            <Link href={`/my-collections/${collectionId}`}>
              <Button
                variant="outline"
                className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
              >
                Cancel
              </Button>
            </Link>
            <Button>Create Artwork</Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
