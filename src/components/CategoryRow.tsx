import { Movie } from '@/lib/types';
import { MovieCard } from './MovieCard';

export function CategoryRow({ title, movies }: { title: string; movies: Movie[] }) {
  return (
    <section className="space-y-3" aria-label={`${title} movies`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {movies.map((movie) => (
          <MovieCard key={movie.slug} movie={movie} />
        ))}
      </div>
    </section>
  );
}
