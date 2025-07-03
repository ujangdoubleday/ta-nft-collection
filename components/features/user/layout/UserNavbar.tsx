'use client';

import { Container } from '@/components/core/layout/container';
import Link from 'next/link';
import { LogOut, Copy, Check, User } from 'lucide-react';
import { useState } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { useWallet } from '@/lib/hooks/wallet';
import { shortenAddress } from '@/lib/utils/formatting';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Logo } from '@/components/core/navigation/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/molecules/dropdown-menu';

export function UserNavbar() {
  const { data: address } = useAddress();
  const { disconnect } = useWallet();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    toast.info('Signing out...');
    await disconnect();
    toast.success('Signed out successfully');
    router.push('/');
  };

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#0A0A0A] pt-2 w-full px-4 transition-all duration-300 navbar">
      <Container>
        <div className="flex justify-between">
          <div className="flex items-center">
            <Logo />
            <Link href="/">
              <h1 className="text-white pl-2 text-2xl font-bold italic">XYZ</h1>
            </Link>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center p-2 rounded-full hover:bg-[#1f1f1f] transition-colors">
                <User className="h-6 w-6 text-white" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 bg-[#0A0A0A] border border-[#1f1f1f] text-white"
              >
                <div className="px-3 py-2 mb-2">
                  <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">
                      {address ? shortenAddress(address) : '0x...'}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 rounded hover:bg-[#1f1f1f] transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <hr className="my-2 border-[#1f1f1f]" />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#1f1f1f] transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Disconnect Wallet</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default UserNavbar;
