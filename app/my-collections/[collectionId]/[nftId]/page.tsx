"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Win98Window } from "@/components/ui/win98";
import { FileUp, Users, Clock, Eye } from "lucide-react";

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
        image: "/assets/images/nfts/pixel-art/pixel-1.jpg",
        attributes: {
          rarity: "Rare",
          pixels: "8x8",
        },
        history: [
          {
            type: "Mint",
            from: "0x0000000000000000000000000000000000000000",
            to: "0xABC...123",
            date: "2023-10-15",
            price: "0.05 ETH",
          },
          {
            type: "Transfer",
            from: "0xABC...123",
            to: "Your Address",
            date: "2023-11-05",
            price: "0.08 ETH",
          },
        ],
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
        image: "/assets/images/nfts/pixel-art/pixel-2.jpg",
        attributes: {
          rarity: "Uncommon",
          pixels: "16x16",
        },
        history: [
          {
            type: "Mint",
            from: "0x0000000000000000000000000000000000000000",
            to: "Your Address",
            date: "2023-10-16",
            price: "0.05 ETH",
          },
        ],
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
        image: "/assets/images/nfts/3d-voxel/voxel-1.svg",
        attributes: {
          dimensions: "24x24x24",
          complexity: "High",
        },
        history: [
          {
            type: "Mint",
            from: "0x0000000000000000000000000000000000000000",
            to: "Your Address",
            date: "2023-11-01",
            price: "5 MATIC",
          },
        ],
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
        image: "/assets/images/nfts/retro-computing/retro-1.svg",
        attributes: {
          era: "1970s",
          style: "Realistic",
        },
        history: [
          {
            type: "Mint",
            from: "0x0000000000000000000000000000000000000000",
            to: "Your Address",
            date: "2023-09-20",
            price: "0.03 ETH",
          },
        ],
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
        image: "/assets/images/nfts/windows-98-icons/win98-1.svg",
        attributes: {
          category: "System",
          resolution: "32x32",
        },
        history: [
          {
            type: "Mint",
            from: "0x0000000000000000000000000000000000000000",
            to: "Your Address",
            date: "2023-12-01",
            price: "0.02 ETH",
          },
        ],
      },
    },
  },
};

export default function NFTDetailPage({
  params,
}: {
  params: { collectionId: string; nftId: string };
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { collectionId, nftId } = unwrappedParams;
  const collection = collections[collectionId as keyof typeof collections];

  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <Win98Window
            title="Error - Collection Not Found"
            className="max-w-4xl mx-auto"
            onClose={() => router.push("/my-collections")}
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
                onClick={() => router.push("/my-collections")}
              >
                Back to Your Gallery
              </Button>
            </div>
          </Win98Window>
        </Container>
      </main>
    );
  }

  const nft = collection.items[nftId as keyof typeof collection.items];

  if (!nft) {
    return (
      <main className="py-4">
        <Container>
          <Win98Window
            title="Error - NFT Not Found"
            className="max-w-4xl mx-auto"
            onClose={() => router.push(`/my-collections/${collectionId}`)}
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
                  The NFT you're looking for couldn't be found in this
                  collection.
                </p>
              </div>
              <Button
                className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                onClick={() => router.push(`/my-collections/${collectionId}`)}
              >
                Back to Collection
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
          title={`NFT Properties - ${nft.name}`}
          className="max-w-6xl mx-auto"
          icon="/assets/icons/windows.png"
        >
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4 mb-4">
                  <div className="win98-bar h-6 flex items-center px-2 mb-3">
                    <span className="text-white text-xs font-semibold tracking-tight">
                      NFT Preview
                    </span>
                  </div>

                  <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white mb-3 p-2">
                    <div className="relative" style={{ aspectRatio: "1/1" }}>
                      <img
                        src={
                          nft.image ||
                          `/assets/images/nfts/${collectionId}/${nftId}.jpg`
                        }
                        alt={nft.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <h3 className="text-black font-bold text-sm mb-1">
                    {nft.name}
                  </h3>
                  <p className="text-black text-xs">{nft.description}</p>
                </div>

                <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
                  <div className="win98-bar h-6 flex items-center px-2 mb-3">
                    <span className="text-white text-xs font-semibold tracking-tight">
                      Properties
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(nft.attributes).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 hover:bg-[#d0d0d0]"
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
                      NFT Details
                    </span>
                  </div>

                  <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-2 mb-3">
                    <table className="w-full text-black text-xs">
                      <tbody>
                        <tr className="bg-[#efefef]">
                          <td className="py-1 px-2 font-bold">Collection</td>
                          <td className="py-1 px-2">{collection.name}</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 font-bold">Asset ID</td>
                          <td className="py-1 px-2">{nft.tokenId}</td>
                        </tr>
                        <tr className="bg-[#efefef]">
                          <td className="py-1 px-2 font-bold">Storage</td>
                          <td className="py-1 px-2">{nft.blockchain}</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 font-bold">Creator</td>
                          <td className="py-1 px-2 break-all">{nft.creator}</td>
                        </tr>
                        <tr className="bg-[#efefef]">
                          <td className="py-1 px-2 font-bold">Owner</td>
                          <td className="py-1 px-2 break-all">{nft.owner}</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 font-bold">Created</td>
                          <td className="py-1 px-2">{nft.mintDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3 mb-4">
                  <div className="win98-bar h-6 flex items-center px-2 mb-3">
                    <span className="text-white text-xs font-semibold tracking-tight">
                      Transfer History
                    </span>
                  </div>

                  <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-1 mb-1 max-h-40 overflow-y-auto">
                    <table className="w-full text-black text-xs">
                      <thead className="bg-[#c0c0c0] sticky top-0">
                        <tr>
                          <th className="py-1 px-2 text-left">Type</th>
                          <th className="py-1 px-2 text-left">From</th>
                          <th className="py-1 px-2 text-left">To</th>
                          <th className="py-1 px-2 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nft.history &&
                          nft.history.map((event, index) => (
                            <tr
                              key={index}
                              className={index % 2 === 0 ? "bg-[#efefef]" : ""}
                            >
                              <td className="py-1 px-2">{event.type}</td>
                              <td className="py-1 px-2">
                                {event.from ===
                                "0x0000000000000000000000000000000000000000"
                                  ? "New Mint"
                                  : event.from}
                              </td>
                              <td className="py-1 px-2">{event.to}</td>
                              <td className="py-1 px-2">{event.date}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                  <div className="win98-bar h-6 flex items-center px-2 mb-3">
                    <span className="text-white text-xs font-semibold tracking-tight">
                      Transfer NFT
                    </span>
                  </div>
                  <p className="text-black text-xs mb-3">
                    Transfer this NFT to another wallet address.
                  </p>
                  <div className="mb-3">
                    <label className="text-black text-xs block mb-1">
                      Recipient Address
                    </label>
                    <Input
                      placeholder="Enter recipient wallet address"
                      className="hover:border-[#0000ff] focus:border-[#0000ff]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]">
                      Transfer NFT
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Win98Window>
      </Container>
    </main>
  );
}
