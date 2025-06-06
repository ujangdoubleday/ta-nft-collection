'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';

interface NFTDetailsProps {
  collectionId: string;
  tokenId: string;
  blockchain: string;
  creator: string;
  owner: string;
  mintDate: string;
}

export function NFTDetails({
  collectionId,
  tokenId,
  blockchain,
  creator,
  owner,
  mintDate,
}: NFTDetailsProps) {
  return (
    <Win98Window title="NFT Details" icon="/assets/icons/window/gallery.png" className="mb-3">
      <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-1 mb-2">
        <table className="w-full text-black text-sm">
          <tbody>
            <tr className="bg-[#efefef]">
              <td className="py-[3px] px-2 font-bold">Collection</td>
              <td className="py-[3px] px-2 truncate max-w-[250px]">{collectionId}</td>
            </tr>
            <tr>
              <td className="py-[3px] px-2 font-bold">Asset ID</td>
              <td className="py-[3px] px-2">{tokenId}</td>
            </tr>
            <tr className="bg-[#efefef]">
              <td className="py-[3px] px-2 font-bold">Storage</td>
              <td className="py-[3px] px-2">{blockchain}</td>
            </tr>
            <tr>
              <td className="py-[3px] px-2 font-bold">Creator</td>
              <td className="py-[3px] px-2 truncate max-w-[250px]">{creator}</td>
            </tr>
            <tr className="bg-[#efefef]">
              <td className="py-[3px] px-2 font-bold">Owner</td>
              <td className="py-[3px] px-2 truncate max-w-[250px]">{owner}</td>
            </tr>
            <tr>
              <td className="py-[3px] px-2 font-bold">Created</td>
              <td className="py-[3px] px-2">{mintDate}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Win98Window>
  );
}
