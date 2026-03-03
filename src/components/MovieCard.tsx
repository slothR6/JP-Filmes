import Link from 'next/link';
import {
  formatAudioPreference,
  formatDuration,
  formatList,
  getMovieHref,
  getPosterSrc,
  isMovieRecentlyAdded
} from '@/lib/movie-utils';
import type { Movie } from '@/lib/types';
import { PosterImage } from './PosterImage';

type MovieCardProps = {
  movie: Movie;
  priority?: boolean;
};

export function MovieCard({ movie, priority = false }: MovieCardProps) {
  const isNew = isMovieRecentlyAdded(movie);

  return (
    <Link
      href={getMovieHref(movie)}
      className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-panel/75 shadow-glow transition duration-300 hover:-translate-y-1 hover:border-accent/70 hover:bg-panel-strong/80"
    >
      <div className="relative">
        <PosterImage
          src={getPosterSrc(movie)}
          alt={`Poster de ${movie.title}`}
          priority={priority}
          className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
          {movie.featured ? (
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-surface">
              Destaque
            </span>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {movie.sourceStatus === 'fallback' ? (
              <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                Fallback
              </span>
            ) : null}
            {isNew ? (
              <span className="rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                Novo
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-lg font-semibold text-ink">{movie.title}</h3>
          <p className="text-sm text-muted">
            {movie.year ?? 'Ano N/D'} - {formatDuration(movie.durationMinutes)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(movie.genres.length ? movie.genres : ['Sem genero']).slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/80"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="mt-auto space-y-1 text-xs text-muted">
          <p className="truncate">{formatList(movie.languages)}</p>
          <p>{formatAudioPreference(movie.audioPreference)}</p>
        </div>
      </div>
    </Link>
  );
}
