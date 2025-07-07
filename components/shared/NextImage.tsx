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
    setImgSrc(src ? (typeof src === 'string' ? src : '') : '');
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

  const defaultBlurDataURL =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2MwYzBjMCIvPjwvc3ZnPg==';

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
