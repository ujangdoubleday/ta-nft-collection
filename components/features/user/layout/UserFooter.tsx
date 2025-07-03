'use client';

import { Container } from '@/components/core/layout/container';

export function UserFooter() {
  return (
    <footer className="py-6 border-t border-[#1f1f1f] mt-auto bg-[#0A0A0A]">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} NFT Marketplace. All rights reserved.
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
              Help
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
