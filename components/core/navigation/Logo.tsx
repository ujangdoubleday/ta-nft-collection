import Link from 'next/link';
import Image from 'next/image';

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center focus:bg-zinc-800/50 rounded-md p-1">
      <Image
        src="/assets/logo/white_full.png"
        alt="MyNFTs Logo"
        width={120}
        height={32}
        className="h-8 w-auto"
      />
    </Link>
  );
};
