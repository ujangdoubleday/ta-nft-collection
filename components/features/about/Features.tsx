import { Win98Window } from "@/components/ui/win98";

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const platformFeatures: Feature[] = [
  {
    icon: "🎨",
    title: "Retro-Styled Interface",
    description:
      "Experience the charm of classic computing with our nostalgic Windows 98 inspired design.",
  },
  {
    icon: "🔒",
    title: "Secure Storage",
    description:
      "All digital assets are securely stored on the blockchain, ensuring ownership authentication.",
  },
  {
    icon: "🖼️",
    title: "NFT Creation",
    description:
      "Create unique digital collectibles with custom properties, descriptions, and artwork.",
  },
  {
    icon: "💼",
    title: "Collection Management",
    description:
      "Organize your digital assets into themed collections for better management and showcase.",
  },
  {
    icon: "🔍",
    title: "Easy Discovery",
    description:
      "Explore other creators' work through our intuitive search and browsing features.",
  },
  {
    icon: "🏆",
    title: "Community Focus",
    description:
      "Connect with other digital artists, share inspiration, and build your creative network.",
  },
];

export function Features() {
  return (
    <Win98Window
      title="Platform Features"
      icon="/assets/icons/window/features.png"
      className="mb-4"
    >
      <div className="p-4 text-black">
        <div className="win98-shadow-inset p-3 bg-white mb-4">
          <p className="text-xs">
            MyNFTs.exe combines nostalgic design with modern blockchain
            technology to deliver a unique digital art creation and collection
            experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2"
            >
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">{feature.icon}</span>
                <p className="text-xs font-bold">{feature.title}</p>
              </div>
              <p className="text-xs">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Win98Window>
  );
}
