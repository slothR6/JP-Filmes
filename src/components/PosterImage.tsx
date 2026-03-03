'use client';

import { useState } from 'react';

const fallbackPoster = '/placeholders/poster.jpg';

type PosterImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function PosterImage({ src, alt, className, priority = false }: PosterImageProps) {
  const normalizedSrc = src || fallbackPoster;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = failedSrc === normalizedSrc ? fallbackPoster : normalizedSrc;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (normalizedSrc !== fallbackPoster) {
          setFailedSrc(normalizedSrc);
        }
      }}
    />
  );
}
