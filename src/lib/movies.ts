import movies from '@/data/movies.json';
import { Movie } from './types';

export const allMovies = movies as Movie[];

export const getMovieBySlug = (slug: string) => allMovies.find((movie) => movie.slug === slug);

export const moviesByGenre = allMovies.reduce<Record<string, Movie[]>>((acc, movie) => {
  acc[movie.genre] = [...(acc[movie.genre] ?? []), movie];
  return acc;
}, {});
