'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface NextImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  fallbackSrc?: string;
  placeholderType?: 'blur' | 'empty' | 'win98';
  wrapperClassName?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
}

export function NextImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = '/assets/images/placeholders/image-placeholder.svg',
  placeholderType = 'blur',
  wrapperClassName,
  className,
  onError,
  blurDataURL,
  unoptimized = true,
  ...rest
}: NextImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(typeof src === 'string' ? src : '');
    setIsLoading(true);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    setIsLoading(false);
    setImgSrc(fallbackSrc);
    if (onError) onError(e);
  };

  // Blur data URL for placeholder type 'blur'
  const defaultBlurDataURL =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2MwYzBjMCIvPjwvc3ZnPg==';

  // Placeholder styles berdasarkan tipe
  const placeholderStyles = {
    blur: 'blur-sm',
    empty: 'bg-[#c0c0c0]',
    win98:
      'bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        placeholderType === 'win98' && 'p-1',
        wrapperClassName,
      )}
      style={
        !rest.fill
          ? {
              width: typeof width === 'number' ? `${width}px` : width,
              height: typeof height === 'number' ? `${height}px` : height,
            }
          : { width: '100%', height: '100%' }
      }
    >
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            placeholderStyles[placeholderType],
          )}
          style={rest.fill ? { position: 'absolute', inset: 0 } : {}}
        >
          {placeholderType === 'win98' && (
            <div className="flex items-center justify-center w-full h-full">
              <svg
                className="w-8 h-8 text-[#808080]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
      )}

      <Image
        src={imgSrc || fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          placeholderType === 'blur' && 'duration-700 ease-in-out',
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL={blurDataURL || defaultBlurDataURL}
        {...rest}
      />
    </div>
  );
}
