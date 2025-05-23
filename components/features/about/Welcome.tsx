import { Win98Window } from "@/components/ui/win98";

export function Welcome() {
  return (
    <Win98Window
      title="Welcome to MyNFTs.exe"
      icon="/assets/icons/window/welcome.png"
      className="mb-4"
    >
      <div className="p-4 text-black">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="win98-shadow-inset p-3 bg-white w-full md:w-2/3">
            <p className="text-sm mb-3">
              Welcome to MyNFTs.exe, a creative platform that celebrates the
              nostalgia of retro computing aesthetics while providing modern
              blockchain functionality.
            </p>
            <p className="text-xs">
              Our platform combines the distinctive charm of classic computing
              interfaces with cutting-edge NFT technology, creating a unique
              space for digital artists to create, showcase, and trade their
              work in an environment that's both nostalgic and functional.
            </p>
          </div>

          <div className="w-full md:w-1/3 flex justify-center">
            <div className="win98-shadow-inset h-32 w-32 bg-white flex items-center justify-center">
              <img
                src="/assets/logo/black.svg"
                alt="MyNFTs.exe Logo"
                className="max-h-24 max-w-24"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2">
          <p className="text-xs">
            <strong>Why Retro Aesthetics?</strong> The distinctive interface of
            classic computing, with its iconic buttons, taskbars, and window
            designs, defined an era of digital creativity. We're bringing that
            charm back to inspire a new generation of digital artists while
            providing modern tools for creating and managing digital assets.
          </p>
        </div>
      </div>
    </Win98Window>
  );
}
