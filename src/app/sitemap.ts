import type { MetadataRoute } from 'next';
import { getAllMovies } from '@/lib/movies';
import { getMovieHref } from '@/lib/movie-utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://jp-filmes.vercel.app';
  const movies = await getAllMovies();

  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/filmes`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/admin/adicionar`, changeFrequency: 'weekly', priority: 0.3 },
    ...movies.map((movie) => ({
      url: `${base}${getMovieHref(movie)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))
  ];
}
