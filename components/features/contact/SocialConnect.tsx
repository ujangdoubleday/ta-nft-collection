'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';

type SocialLink = {
  name: string;
  url: string;
  icon: string;
  description: string;
};

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/ujangbedog',
    icon: '💻',
    description: 'Check out my code repositories and open-source projects',
  },
];

export function SocialConnect() {
  return (
    <Win98Window title="Connect Online" icon="/assets/icons/window/globe.png" className="mb-4">
      <div className="p-4 text-black">
        <p className="text-sm mb-3">
          Find me on various platforms and stay connected with the latest updates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socialLinks.map((link) => (
            <div
              key={link.name}
              className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 cursor-pointer hover:bg-[#d0d0d0]"
              onClick={() => window.open(link.url, '_blank')}
            >
              <div className="flex items-center mb-1">
                <span className="text-xl mr-2">{link.icon}</span>
                <p className="text-xs font-bold text-[#0000AA]">{link.name}</p>
              </div>
              <p className="text-xs">{link.description}</p>
              <div className="mt-2 win98-shadow-inset bg-white p-1">
                <p className="text-[10px] font-mono overflow-hidden overflow-ellipsis">
                  {link.url}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Win98Window>
  );
}
