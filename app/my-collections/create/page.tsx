import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateCollectionPage() {
  return (
    <main className="py-4">
      <Container>
        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
          <div className="win98-bar h-6 flex items-center px-2 mb-4">
            <span className="text-white text-xs font-semibold tracking-tight">
              Create New Collection
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-black text-xs block mb-1">
                    Collection Name *
                  </label>
                  <Input placeholder="Enter collection name" required />
                  <p className="text-xs text-[#808080] mt-1">
                    Choose a memorable name for your digital art collection
                  </p>
                </div>

                <div>
                  <label className="text-black text-xs block mb-1">
                    Symbol *
                  </label>
                  <Input
                    placeholder="Enter collection symbol (e.g. PIXEL)"
                    required
                    maxLength={5}
                  />
                  <p className="text-xs text-[#808080] mt-1">
                    A short identifier for your collection (max 5 characters)
                  </p>
                </div>

                <div>
                  <label className="text-black text-xs block mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-sm h-24"
                    placeholder="Tell the story behind your collection"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-black text-xs block mb-1">
                  Collection Cover Art
                </label>
                <div className="win98-shadow-inset h-40 w-full bg-white p-2 flex flex-col items-center justify-center">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center mx-auto mb-2">
                      <span className="text-black text-2xl">+</span>
                    </div>
                    <p className="text-xs text-black">
                      Upload a cover image for your collection
                    </p>
                  </div>
                  <Button size="sm" className="text-xs">
                    Browse Files...
                  </Button>
                </div>
                <p className="text-xs text-[#808080] mt-1">
                  Recommended size: 350 x 350 pixels
                </p>
              </div>

              <div>
                <label className="text-black text-xs block mb-1">
                  Storage Method
                </label>
                <select className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm">
                  <option>Ethereum</option>
                  <option>Polygon</option>
                  <option>Binance Smart Chain</option>
                  <option>Solana</option>
                </select>
                <p className="text-xs text-[#808080] mt-1">
                  Select where your digital assets will be stored
                </p>
              </div>
            </div>
          </div>

          <div className="win98-shadow-inset mt-6 p-3 bg-white">
            <p className="text-xs mb-2">
              <strong>Note:</strong> Creating a collection is the first step to
              bringing your digital artwork to life.
            </p>
          </div>

          <div className="flex justify-between mt-6">
            <Link href="/my-collections">
              <Button
                variant="outline"
                className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
              >
                Cancel
              </Button>
            </Link>
            <Button>Create Collection</Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
