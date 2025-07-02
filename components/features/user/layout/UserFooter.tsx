'use client';

import { Container } from '@/components/core/layout/container';

export function UserFooter() {
  return (
    <footer className="py-6 border-t border-zinc-800 mt-auto">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} NFT Marketplace. All rights reserved.
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              Terms
            </a>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              Help
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
