"use client";

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
              <td className="py-1 px-2">{collectionId}</td>
            </tr>
            <tr>
              <td className="py-1 px-2 font-bold">Asset ID</td>
              <td className="py-1 px-2">{tokenId}</td>
            </tr>
            <tr className="bg-[#efefef]">
              <td className="py-1 px-2 font-bold">Storage</td>
              <td className="py-1 px-2">{blockchain}</td>
            </tr>
            <tr>
              <td className="py-1 px-2 font-bold">Creator</td>
              <td className="py-1 px-2 break-all">{creator}</td>
            </tr>
            <tr className="bg-[#efefef]">
              <td className="py-1 px-2 font-bold">Owner</td>
              <td className="py-1 px-2 break-all">{owner}</td>
            </tr>
            <tr>
              <td className="py-1 px-2 font-bold">Created</td>
              <td className="py-1 px-2">{mintDate}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
