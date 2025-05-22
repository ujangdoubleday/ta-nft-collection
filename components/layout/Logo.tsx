import Link from "next/link";
import Image from "next/image";

export const Logo = () => (
  <Link href="/">
    <div className="flex items-center">
      <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1">
        <Image
          src="/assets/logo/black.svg"
          alt="MyNFTs Logo"
          width={38}
          height={38}
          priority
        />
      </div>
      <span className="ml-2 text-black font-bold hidden md:inline-block">
        MyNFTs.exe
      </span>
    </div>
  </Link>
);
