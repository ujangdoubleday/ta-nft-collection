"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Win98Window } from "@/components/ui/win98";
import Link from "next/link";

export default function Home() {
  return (
    <main className="py-4">
      <Container>
        <Win98Window
          title="MyNFTs.exe: Digital Art Creator"
          icon="/assets/icons/nft.png"
          className="mb-4"
        >
          <div className="space-y-4 text-black">
            <h2 className="text-lg font-bold">
              Create, Mint & Own Digital Masterpieces
            </h2>
            <p className="text-sm mb-6">
              Express your creativity through digital art on the blockchain.
              Create unique collectibles, build your portfolio, and own
              exclusive digital assets with our retro-inspired platform.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Win98Window
                title="Creator's Journey"
                icon="/assets/icons/journey.png"
                className="h-full"
              >
                <div className="space-y-2 p-2">
                  <div className="flex items-start">
                    <div className="bg-[#c0c0c0] border-[1px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-black text-xs">1</span>
                    </div>
                    <p className="text-xs">
                      Design a collection to showcase your artistic vision
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#c0c0c0] border-[1px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-black text-xs">2</span>
                    </div>
                    <p className="text-xs">
                      Mint digital assets with blockchain authenticity
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#c0c0c0] border-[1px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-black text-xs">3</span>
                    </div>
                    <p className="text-xs">
                      Build and curate your digital portfolio
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#c0c0c0] border-[1px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-black text-xs">4</span>
                    </div>
                    <p className="text-xs">
                      Share your creations with the world
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <Link href="/collections">
                    <Button>Explore Your Gallery</Button>
                  </Link>
                </div>
              </Win98Window>

              <Win98Window
                title="Start Creating"
                icon="/assets/icons/create.png"
                className="h-full"
              >
                <div className="p-2">
                  <p className="text-xs mb-4">
                    Ready to bring your digital art to life? Launch your
                    creative journey with a new collection that represents your
                    unique artistic style.
                  </p>
                  <div className="win98-shadow-inset h-32 w-full bg-white mb-4 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center">
                      <span className="text-black text-2xl">+</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Link href="/collections/new">
                      <Button>Create Collection</Button>
                    </Link>
                  </div>
                </div>
              </Win98Window>
            </div>
          </div>
        </Win98Window>
      </Container>
    </main>
  );
}
