"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Win98Window } from "@/components/ui/win98";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCollectionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    coverImage: null,
    storage: "Ethereum",
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Would handle actual form submission here
    alert("Collection created successfully!");
    router.push("/collections");
  };

  const handleCancel = () => {
    router.push("/collections");
  };

  return (
    <main className="py-4">
      <Container>
        <Win98Window
          title="Create Collection - NFT Creator Wizard"
          className="max-w-6xl mx-auto"
          // onClose={handleCancel}
          icon="/assets/icons/windows.png"
        >
          <form onSubmit={handleSubmit} className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-black text-xs font-bold block mb-1">
                      Collection Name <span className="text-red-600">*</span>
                    </label>
                    <Input
                      placeholder="Enter collection name"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="hover:border-[#0000ff] focus:border-[#0000ff]"
                    />
                    <p className="text-xs text-[#808080] mt-1">
                      Choose a memorable name for your digital art collection
                    </p>
                  </div>

                  <div>
                    <label className="text-black text-xs font-bold block mb-1">
                      Symbol <span className="text-red-600">*</span>
                    </label>
                    <Input
                      placeholder="Enter collection symbol (e.g. PIXEL)"
                      required
                      maxLength={5}
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleChange}
                      className="hover:border-[#0000ff] focus:border-[#0000ff]"
                    />
                    <p className="text-xs text-[#808080] mt-1">
                      A short identifier for your collection (max 5 characters)
                    </p>
                  </div>

                  <div>
                    <label className="text-black text-xs font-bold block mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-sm h-24 hover:border-[#0000ff] focus:border-[#0000ff] focus:outline-none"
                      placeholder="Tell the story behind your collection"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-black text-xs font-bold block mb-1">
                    Collection Cover Art
                  </label>
                  <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white h-40 w-full bg-white p-2 flex flex-col items-center justify-center">
                    <div className="text-center mb-2">
                      <div className="w-16 h-16 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center mx-auto mb-2 hover:bg-[#d0d0d0] cursor-pointer">
                        <span className="text-black text-2xl">+</span>
                      </div>
                      <p className="text-xs text-black">
                        Upload a cover image for your collection
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="text-xs hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                    >
                      Browse Files...
                    </Button>
                  </div>
                  <p className="text-xs text-[#808080] mt-1">
                    Recommended size: 350 x 350 pixels
                  </p>
                </div>

                <div>
                  <label className="text-black text-xs font-bold block mb-1">
                    Storage Method
                  </label>
                  <select
                    className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm hover:border-[#0000ff]"
                    name="storage"
                    value={formData.storage}
                    onChange={handleChange}
                  >
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

            <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white mt-6 p-3 bg-white">
              <p className="text-xs mb-2">
                <span className="font-bold text-[#0000ff]">Note:</span> Creating
                a collection is the first step to bringing your digital artwork
                to life.
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
              >
                Create Collection
              </Button>
            </div>
          </form>
        </Win98Window>
      </Container>
    </main>
  );
}
