import 'server-only';

import { readStoredMovies } from '@/lib/movie-store';
import { hydrateMovieRecord } from '@/lib/tmdb';

export async function getAllMovies() {
  const records = await readStoredMovies();
  const movies = await Promise.all(records.map((record) => hydrateMovieRecord(record)));

  return movies.sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return Date.parse(right.addedAt) - Date.parse(left.addedAt);
  });
}

export async function getMovieById(id: string) {
  const movies = await getAllMovies();
  return movies.find((movie) => movie.id === id);
}

export async function getMovieIds() {
  const records = await readStoredMovies();
  return records.map((record) => record.id);
}
