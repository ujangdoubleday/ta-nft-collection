"use client";

import { Button } from "@/components/ui/button";
import { Win98Window } from "@/components/ui/win98";
import Link from "next/link";
import { useState } from "react";

export function StartCreating() {
  const [hovered, setHovered] = useState(false);

  return (
    <Win98Window
      title="Start Creating"
      icon="/assets/icons/create-art.png"
      className="h-full"
    >
      <div className="p-3">
        <p className="text-xs text-black mb-4">
          Ready to bring your digital art to life? Launch your creative journey
          with a new collection that represents your unique artistic style.
        </p>

        <div
          className="win98-shadow-inset h-40 w-full bg-white mb-4 flex items-center justify-center"
          style={{
            background: hovered
              ? "linear-gradient(45deg, #E6E6E6 25%, #FFFFFF 25%, #FFFFFF 50%, #E6E6E6 50%, #E6E6E6 75%, #FFFFFF 75%)"
              : "white",
            backgroundSize: hovered ? "20px 20px" : "auto",
          }}
        >
          <div
            className={`w-20 h-20 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center transition-transform duration-200 ${
              hovered ? "scale-110" : ""
            }`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="relative">
              <span className="text-black text-3xl">+</span>
              <span className="absolute -top-1 -right-1 text-sm">🎨</span>
            </div>
          </div>
        </div>

        <div className="win98-shadow-inset p-2 bg-white mb-4">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 mr-2"></div>
            <p className="text-xs text-black">
              <span className="font-bold">Pro Tip:</span> Start with a theme for
              your collection to maintain consistent style
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/collections/new">
            <Button className="px-6 py-1 flex items-center gap-2">
              <span>Create Collection</span>
              <span>✨</span>
            </Button>
          </Link>
        </div>
      </div>
    </Win98Window>
  );
}
