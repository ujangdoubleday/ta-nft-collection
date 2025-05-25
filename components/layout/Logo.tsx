import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <span className="text-base font-bold text-black">
        MyNFTs<span className="text-sm">.exe</span>
      </span>
    </Link>
  );
};
