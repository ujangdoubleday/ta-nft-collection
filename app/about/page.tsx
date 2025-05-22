import { Container } from "@/components/ui/container";
import { Win98Window } from "@/components/ui/win98";

export default function AboutPage() {
  return (
    <main className="py-4">
      <Container>
        <Win98Window
          title="About MyNFTs.exe"
          icon="/assets/icons/info.png"
          className="mb-4"
        >
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
        </Win98Window>
      </Container>
    </main>
  );
}
