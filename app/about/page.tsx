import { Container } from "@/components/ui/container";

export default function AboutPage() {
  return (
    <main className="py-4">
      <Container>
        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
          <div className="win98-bar h-6 flex items-center px-2 mb-4">
            <span className="text-white text-xs font-semibold tracking-tight">
              About MyNFTs.exe
            </span>
          </div>

          <div className="space-y-4 text-black">
            <p>
              Welcome to MyNFTs.exe, a creative platform that celebrates the
              nostalgia of retro computing aesthetics.
            </p>

            <div className="win98-shadow-inset p-3 bg-white">
              <p className="text-sm mb-2">
                <strong>Our Mission</strong>
              </p>
              <p className="text-xs">
                To empower digital artists with a uniquely designed platform for
                creating, showcasing, and sharing authentic digital artwork.
              </p>
            </div>

            <p className="text-sm">
              <strong>Why Retro Aesthetics?</strong>
            </p>
            <p className="text-xs">
              The distinctive interface of classic computing, with its iconic
              buttons, taskbars, and window designs, defined an era of digital
              creativity. We're bringing that charm back to inspire a new
              generation of digital artists.
            </p>

            <p className="text-sm">
              <strong>Our Features</strong>
            </p>
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li>Authentic retro-styled user interface</li>
              <li>Secure digital asset storage</li>
              <li>Create and share your own digital artwork</li>
              <li>Browse and collect unique digital creations</li>
              <li>Community of creative digital artists</li>
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}
