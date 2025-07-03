'use client';

import { Container } from '@/components/core/layout/container';
import { Heart, CheckCircle2 } from 'lucide-react';

export function UserFooter() {
  return (
    <footer className="py-6 px-6 md:px-3 lg:px-6 border-t border-[#1f1f1f] mt-auto bg-[#0A0A0A]">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm flex items-center">
            <span>XYZ © {new Date().getFullYear()} | Made with</span>
            <Heart className="w-4 h-4 mx-1 fill-white text-white" />
            <span>by ilham alfath.</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CheckCircle2 className="w-4 h-4 fill-white text-white" />
            <span>All systems normal</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
