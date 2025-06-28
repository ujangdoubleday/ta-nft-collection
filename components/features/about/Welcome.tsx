import { Win98Window } from '@/components/ui/organisms/Win98Window';
import Image from 'next/image';

export function Welcome() {
  return (
    <Win98Window
      title="Welcome to MyNFTs.exe"
      icon="/assets/icons/window/welcome.png"
      className="mb-4"
    >
      <div className="p-4 text-black">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="win98-shadow-inset p-3 bg-white w-full">
            <p className="text-sm mb-3">
              Welcome to MyNFTs.exe! A creative platform that blends the nostalgic feel of classic
              design aesthetics with modern blockchain functionality.
            </p>
            <p className="text-xs">
              Here, the charm of classic interfaces meets cutting-edge NFT technology, creating a
              unique space for digital artists to create, showcase, and trade their work in an
              environment that's both familiar and functional.
            </p>
          </div>
        </div>

        <div className="mt-4 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2">
          <p className="text-xs">
            <strong>Why Classic Aesthetics?</strong> We believe that interfaces with their iconic
            buttons and windows defined an era of digital creativity. We're bringing that charm back
            to inspire a new generation of artists, while providing modern tools to manage digital
            assets.
          </p>
        </div>
      </div>
    </Win98Window>
  );
}
