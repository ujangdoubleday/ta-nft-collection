import { Win98Window } from "@/components/ui/win98";

export function Mission() {
  return (
    <Win98Window
      title="Our Mission"
      icon="/assets/icons/window/mission.png"
      className="mb-4"
    >
      <div className="space-y-4 p-4 text-black">
        <div className="win98-shadow-inset p-3 bg-white">
          <p className="text-sm mb-2">
            <strong>Our Mission Statement</strong>
          </p>
          <p className="text-xs">
            To empower digital artists with a uniquely designed platform for
            creating, showcasing, and sharing authentic digital artwork in a
            secure, blockchain-enabled environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-[#c0c0c0] p-2 border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
            <p className="text-xs font-bold mb-2">Vision</p>
            <p className="text-xs">
              To become the premier destination for retro-styled digital art
              creation and collection, bridging nostalgia with cutting-edge
              blockchain technology.
            </p>
          </div>
          <div className="bg-[#c0c0c0] p-2 border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
            <p className="text-xs font-bold mb-2">Values</p>
            <p className="text-xs">
              Creativity, Security, Accessibility, Community, and Authenticity
              drive everything we do at MyNFTs.exe.
            </p>
          </div>
        </div>
      </div>
    </Win98Window>
  );
}
