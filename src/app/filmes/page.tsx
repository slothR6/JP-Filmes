import { CatalogPage } from '@/components/catalog/CatalogPage';
import { getAllMovies } from '@/lib/movies';

export const dynamic = 'force-dynamic';

export default async function MoviesPage() {
  const movies = await getAllMovies();

  return <CatalogPage movies={movies} />;
}
