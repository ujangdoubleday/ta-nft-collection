'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { NFTItem } from '@/components/features/collections/types';
import {
  NFTPreview,
  NFTDetails,
  NFTProperties,
  NFTHistory,
  NFTTransferForm,
} from './components/nft';

interface NFTDetailProps {
  collectionId: string;
  nftId: string;
  nft: NFTItem;
}

export function NFTDetail({ collectionId, nftId: _nftId, nft }: NFTDetailProps) {
  return (
    <Win98Window
      title={`NFT: ${nft.name}`}
      icon="/assets/icons/window/gallery.png"
      className="max-w-12xl mx-auto"
    >
      <div className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <NFTPreview name={nft.name} description={nft.description} image={nft.image} />
          </div>

          <div className="md:col-span-6">
            <NFTProperties attributes={nft.attributes} />

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
