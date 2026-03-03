import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/types';

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movie/${movie.slug}`} className="group relative min-w-44 max-w-44 overflow-hidden rounded-lg border border-white/10 bg-card transition-transform hover:-translate-y-1 hover:border-accent">
      <Image
        src={movie.posterUrl}
        alt={`${movie.title} poster`}
        width={300}
        height={450}
        className="h-64 w-full object-cover"
        loading="lazy"
      />
      <div className="p-3">
        <p className="line-clamp-1 font-semibold">{movie.title}</p>
        <p className="text-sm text-white/70">{movie.year}</p>
      </div>
    </Link>
  );
}
