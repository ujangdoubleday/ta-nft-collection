import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Sample collections data
const collections = {
  "pixel-art": {
    name: "Pixel Art",
    description:
      "Classic pixel art celebrating the golden age of digital creativity",
    items: {
      "pixel-1": {
        name: "Pixel Art #1",
        description:
          "A beautiful 8x8 pixel art piece featuring a landscape scene.",
        type: "Digital Art",
        creator: "Your Address",
        owner: "Your Address",
        mintDate: "2023-10-15",
        tokenId: "1",
        blockchain: "Ethereum",
        attributes: {
          rarity: "Rare",
          pixels: "8x8",
        },
      },
      "pixel-2": {
        name: "Pixel Art #2",
        description: "A pixelated character inspired by classic arcade games.",
        type: "Digital Art",
        creator: "Your Address",
        owner: "Your Address",
        mintDate: "2023-10-16",
        tokenId: "2",
        blockchain: "Ethereum",
        attributes: {
          rarity: "Uncommon",
          pixels: "16x16",
        },
      },
    },
  },
  "3d-voxel": {
    name: "3D Voxel",
    items: {
      "voxel-1": {
        name: "Voxel Art #1",
        description: "A 3D voxel model of a futuristic cityscape.",
        type: "3D Model",
        creator: "Your Address",
        owner: "Your Address",
        mintDate: "2023-11-01",
        tokenId: "1",
        blockchain: "Polygon",
        attributes: {
          dimensions: "24x24x24",
          complexity: "High",
        },
      },
    },
  },
  "retro-computing": {
    name: "Retro Computing",
    items: {
      "retro-1": {
        name: "Retro Computer #1",
        description:
          "An artistic rendering of a vintage 1970s computer terminal.",
        type: "Digital Art",
        creator: "Your Address",
        owner: "Your Address",
        mintDate: "2023-09-20",
        tokenId: "1",
        blockchain: "Ethereum",
        attributes: {
          era: "1970s",
          style: "Realistic",
        },
      },
    },
  },
  "windows-98-icons": {
    name: "Classic Icons",
    items: {
      "icon-1": {
        name: "Classic Icon #1",
        description: "A recreation of a classic computer icon in retro style.",
        type: "Icon Pack",
        creator: "Your Address",
        owner: "Your Address",
        mintDate: "2023-12-01",
        tokenId: "1",
        blockchain: "Ethereum",
        attributes: {
          category: "System",
          resolution: "32x32",
        },
      },
    },
  },
};

export default function NFTDetailPage({
  params,
}: {
  params: { collectionId: string; nftId: string };
}) {
  const { collectionId, nftId } = params;
  const collection = collections[collectionId as keyof typeof collections];

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

  const nft = collection.items[nftId as keyof typeof collection.items];

  if (!nft) {
    return (
      <main className="py-4">
        <Container>
          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
            <div className="win98-bar h-6 flex items-center px-2 mb-4">
              <span className="text-white text-xs font-semibold tracking-tight">
                Artwork Not Found
              </span>
            </div>
            <div className="text-black p-3">
              <p>
                The digital artwork you're looking for couldn't be found in this
                collection.
              </p>
              <Link href={`/my-collections/${collectionId}`}>
                <Button className="mt-4">Back to Collection</Button>
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
              Artwork: {nft.name}
            </span>
          </div>

          <div className="flex items-center mb-4">
            <Link href={`/my-collections/${collectionId}`}>
              <Button size="sm" className="text-xs h-6 py-0 px-2 mr-2">
                ← Back to Collection
              </Button>
            </Link>
            <p className="text-black text-xs">
              View and manage this digital artwork
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="win98-shadow-inset bg-white p-4 mb-4">
                <div className="win98-shadow-inset h-64 w-full bg-white mb-3 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-black">Artwork Preview</p>
                  </div>
                </div>
                <h3 className="text-black font-bold text-sm mb-1">
                  {nft.name}
                </h3>
                <p className="text-black text-xs">{nft.description}</p>
              </div>

              <div className="win98-shadow-inset bg-white p-4">
                <h3 className="text-black font-bold text-sm mb-2">
                  Properties
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(nft.attributes).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2"
                    >
                      <p className="text-black text-xs uppercase">{key}</p>
                      <p className="text-black text-xs font-bold">
                        {value as string}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3 mb-4">
                <div className="win98-bar h-6 flex items-center px-2 mb-3">
                  <span className="text-white text-xs font-semibold tracking-tight">
                    Artwork Details
                  </span>
                </div>

                <table className="w-full text-black text-xs">
                  <tbody>
                    <tr>
                      <td className="py-2 pr-4 font-bold">Collection</td>
                      <td className="py-2">{collection.name}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-bold">Asset ID</td>
                      <td className="py-2">{nft.tokenId}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-bold">Storage</td>
                      <td className="py-2">{nft.blockchain}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-bold">Creator</td>
                      <td className="py-2 break-all">{nft.creator}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-bold">Owner</td>
                      <td className="py-2 break-all">{nft.owner}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-bold">Created</td>
                      <td className="py-2">{nft.mintDate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                <div className="win98-bar h-6 flex items-center px-2 mb-3">
                  <span className="text-white text-xs font-semibold tracking-tight">
                    Transfer Artwork
                  </span>
                </div>
                <p className="text-black text-xs mb-3">
                  Transfer this digital artwork to another wallet address.
                </p>
                <div className="mb-3">
                  <label className="text-black text-xs block mb-1">
                    Recipient Address
                  </label>
                  <Input placeholder="Enter recipient wallet address" />
                </div>
                <div className="flex justify-end">
                  <Button>Transfer</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
