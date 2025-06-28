import { Win98Window } from '@/components/ui/organisms/Win98Window';

export function Team() {
  return (
    <Win98Window title="Creator" icon="/assets/icons/window/developer.png" className="mb-4">
      <div className="p-4 text-black">
        <p className="mb-4 text-sm">
          MyNFTs.exe is a project created and maintained by a solo developer who is passionate about
          blockchain technology.
        </p>

        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="win98-shadow-inset h-32 w-32 bg-white flex-shrink-0 flex items-center justify-center">
              <div className="bg-[#c0c0c0] w-28 h-28 flex items-center justify-center text-5xl font-bold">
                IA
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">ILHAM ALFATH</h3>
              <p className="text-xs text-[#0000AA] mb-2">Creator & Developer</p>
              <div className="win98-shadow-inset p-3 bg-white">
                <p className="text-xs">
                  A full-stack developer with a passion for classic design aesthetics and blockchain
                  technology. MyNFTs.exe was created to combine a nostalgic feel with modern NFT
                  capabilities, providing artists with a unique platform to showcase their work.
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-[#c0c0c0] border-[1px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1">
                  <p className="text-xs font-bold">Skills:</p>
                  <p className="text-xs">Web3, Blockchain, DApp Development, Web Development</p>
                </div>
                <div className="bg-[#c0c0c0] border-[1px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1">
                  <p className="text-xs font-bold">Interests:</p>
                  <p className="text-xs">Classic Design, Digital Art, NFTs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Win98Window>
  );
}
