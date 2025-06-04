"use client";

import { Button } from "@/components/ui/atoms/button";
import { Win98Window } from "@/components/ui/organisms/Win98Window";
import { useRouter } from "next/navigation";

interface NFTErrorMessageProps {
  collectionId: string;
  title?: string;
  icon?: string;
}

export const NFTErrorMessage = ({
  collectionId,
  title = "Error - NFT Not Found",
  icon = "/assets/icons/window/gallery.png",
}: NFTErrorMessageProps) => {
  const router = useRouter();

  return (
    <Win98Window
      title={title}
      className="max-w-4xl mx-auto"
      onClose={() => router.push(`/collections/${collectionId}`)}
      icon={icon}
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
            The NFT you&apos;re looking for couldn&apos;t be found in this
            collection.
          </p>
        </div>
        <Button
          className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
          onClick={() => router.push(`/collections/${collectionId}`)}
        >
          Back to Collection
        </Button>
      </div>
    </Win98Window>
  );
};


