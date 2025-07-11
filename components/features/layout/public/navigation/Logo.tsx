import Link from 'next/link';
import { NextImage } from '@/components/shared/NextImage';

interface LogoProps {
  linkDisabled?: boolean;
  className?: string;
  isClone?: boolean;
}

export const Logo = ({ linkDisabled = false, className = '', isClone = false }: LogoProps) => {
  const LogoImage = (
    <NextImage
      src="/assets/logo/white_full.png"
      alt="MyNFTs Logo"
      width={32}
      height={32}
      className={`h-8 w-auto ${isClone ? 'logo-clone' : 'logo-main'}`}
      priority
      quality={90}
      placeholderType="empty"
    />
  );

  const wrapperClass = `logo-wrapper ${className}`;

  if (linkDisabled) {
    return (
      <div className={`flex items-center focus:bg-zinc-800/50 rounded-md p-1 ${wrapperClass}`}>
        {LogoImage}
      </div>
    );
  }

  return (
    <Link
      href="/"
      className={`flex items-center focus:bg-zinc-800/50 rounded-md p-1 ${wrapperClass}`}
    >
      {LogoImage}
    </Link>
  );
};
