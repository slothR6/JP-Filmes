import { HeroBanner } from '@/components/HeroBanner';
import { CategoryRow } from '@/components/CategoryRow';
import { FutureMonetization } from '@/components/FutureMonetization';
import { AdSlot } from '@/components/AdSlot';
import { allMovies, moviesByGenre } from '@/lib/movies';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <HeroBanner movie={allMovies[0]} />
      <AdSlot />
      {Object.entries(moviesByGenre).map(([genre, movies]) => (
        <CategoryRow key={genre} title={genre} movies={movies} />
      ))}
      <FutureMonetization />
    </div>
  );
}
