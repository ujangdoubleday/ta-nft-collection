"use client";

import { Button } from "@/components/ui/button";
import { Win98Window } from "@/components/ui/win98";
import Link from "next/link";

const steps = [
  {
    number: 1,
    text: "Design a collection to showcase your artistic vision",
    icon: "🎨",
  },
  {
    number: 2,
    text: "Mint digital assets with blockchain authenticity",
    icon: "🔒",
  },
  {
    number: 3,
    text: "Build and curate your digital portfolio",
    icon: "📁",
  },
  {
    number: 4,
    text: "Share your creations with the world",
    icon: "🌎",
  },
];

export function CreatorsJourney() {
  return (
    <Win98Window
      title="Creator's Journey"
      icon="/assets/icons/journey-art.png"
      className="h-full"
    >
      <div className="p-3">
        <div className="win98-shadow-inset bg-white p-2 mb-4">
          <p className="text-xs text-black font-bold">
            Follow these simple steps to begin your digital art journey
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex items-start bg-[#c0c0c0] p-2 border-[1px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
            >
              <div className="bg-[#1084d0] text-white w-6 h-6 flex items-center justify-center mr-2 rounded-full flex-shrink-0">
                <span className="text-white text-xs">{step.number}</span>
              </div>
              <p className="text-xs text-black flex-1">{step.text}</p>
              <div className="ml-2 text-lg">{step.icon}</div>
            </div>
          ))}
        </div>

        <div className="progress-bar win98-shadow-inset bg-white h-4 w-full mt-4 mb-4">
          <div className="bg-[#1084d0] h-full" style={{ width: "25%" }}></div>
        </div>

        <div className="mt-4 flex justify-center">
          <Link href="/collections">
            <Button className="px-4">Explore Your Gallery</Button>
          </Link>
        </div>
      </div>
    </Win98Window>
  );
}
