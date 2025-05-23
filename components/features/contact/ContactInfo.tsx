import { Win98Window } from "@/components/ui/win98";

export function ContactInfo() {
  return (
    <Win98Window
      title="Get in Touch"
      icon="/assets/icons/email.png"
      className="mb-4"
    >
      <div className="p-4 space-y-4 text-black">
        <p className="text-sm">
          I'd love to hear from you! Whether you have questions about
          MyNFTs.exe, feature requests, or just want to chat about retro
          computing and NFTs, feel free to reach out.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="win98-shadow-inset p-3 bg-white">
            <p className="text-sm mb-2 font-bold text-[#0000AA]">
              Direct Contact
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-5 h-5 flex-shrink-0 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <p className="text-xs">Email: ujangbedog@example.com</p>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 flex-shrink-0 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <p className="text-xs">Phone: (+62) 812-3456-7890</p>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 flex-shrink-0 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M16 2v4"></path>
                    <path d="M8 2v4"></path>
                    <path d="M3 10h18"></path>
                  </svg>
                </div>
                <p className="text-xs">Response Time: Within 24-48 hours</p>
              </div>
            </div>
          </div>

          <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2">
            <p className="text-xs font-bold mb-2">About The Creator</p>
            <div className="flex gap-3">
              <div className="win98-shadow-inset h-16 w-16 bg-white flex-shrink-0 flex items-center justify-center">
                <div className="bg-[#c0c0c0] w-14 h-14 flex items-center justify-center text-2xl font-bold">
                  UB
                </div>
              </div>
              <div>
                <p className="text-xs font-bold">UJANG BEDOG</p>
                <p className="text-xs text-[#0000AA] mb-1">
                  Creator & Developer
                </p>
                <p className="text-xs">
                  Full-stack developer specializing in web development and
                  blockchain technology, with a passion for retro computing
                  aesthetics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Win98Window>
  );
}
