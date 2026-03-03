import { MetadataRoute } from 'next';
import { allMovies } from '@/lib/movies';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://jp-filmes.vercel.app';
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/legal`, changeFrequency: 'monthly', priority: 0.7 },
    ...allMovies.map((movie) => ({
      url: `${base}/movie/${movie.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))
  ];
}
