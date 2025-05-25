"use client";

import { Win98Window } from "@/components/ui/win98";
import { NFTItem } from "./types";
import {
  NFTPreview,
  NFTDetails,
  NFTProperties,
  NFTHistory,
  NFTTransferForm,
} from "./components/nft";

interface NFTDetailProps {
  collectionId: string;
  nftId: string;
  nft: NFTItem;
}

export function NFTDetail({
  collectionId,
  nftId: _nftId,
  nft,
}: NFTDetailProps) {
  return (
    <Win98Window
      title={`NFT: ${nft.name}`}
      className="max-w-6xl mx-auto"
      icon="/assets/icons/window/gallery.png"
    >
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <NFTPreview
              name={nft.name}
              description={nft.description}
              image={nft.image}
            />

            <NFTProperties attributes={nft.attributes} />
          </div>

          <div className="md:col-span-2">
            <NFTDetails
              collectionId={collectionId}
              tokenId={nft.tokenId}
              blockchain={nft.blockchain}
              creator={nft.creator}
              owner={nft.owner}
              mintDate={nft.mintDate}
            />

            <NFTHistory history={nft.history} />

            <NFTTransferForm />
          </div>
        </div>
      </div>
    </Win98Window>
  );
}
