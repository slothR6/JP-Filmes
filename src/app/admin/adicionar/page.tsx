import { AddMovieManager } from '@/components/admin/AddMovieManager';
import { getAllMovies } from '@/lib/movies';

export const dynamic = 'force-dynamic';

export default async function AdminAddMoviePage() {
  const movies = await getAllMovies();

  return <AddMovieManager initialMovies={movies} />;
}
