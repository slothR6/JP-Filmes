import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MovieCard } from '@/components/MovieCard';
import { PosterImage } from '@/components/PosterImage';
import {
  formatAudioPreference,
  formatDateLabel,
  formatDuration,
  formatList,
  formatRating,
  getBackdropSrc,
  getPosterSrc,
  getRelatedMovies,
  isMovieRecentlyAdded
} from '@/lib/movie-utils';
import { getAllMovies, getMovieById } from '@/lib/movies';

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieById(id);

  if (!movie) {
    return {};
  }

  const poster = getPosterSrc(movie, 'w780');

  return {
    title: movie.title,
    description: movie.synopsis,
    openGraph: {
      title: movie.title,
      description: movie.synopsis,
      images: [poster]
    },
    twitter: {
      card: 'summary_large_image',
      title: movie.title,
      description: movie.synopsis,
      images: [poster]
    }
  };
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const { id } = await params;
  const [movie, movies] = await Promise.all([getMovieById(id), getAllMovies()]);

  if (!movie) {
    notFound();
  }

  const relatedMovies = getRelatedMovies(movie, movies).slice(0, 4);
  const isNew = isMovieRecentlyAdded(movie);
  const backdrop = getBackdropSrc(movie);

  return (
    <div className="space-y-10 pb-10">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-panel/80 shadow-glow">
        {backdrop ? (
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(6,11,17,0.2), rgba(6,11,17,0.96)), url(${backdrop})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
        ) : null}

        <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/15">
            <PosterImage
              src={getPosterSrc(movie)}
              alt={`Poster de ${movie.title}`}
              priority
              className="aspect-[2/3] w-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {movie.featured ? (
                <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-surface">
                  Destaque
                </span>
              ) : null}
              {isNew ? (
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
                  Recente
                </span>
              ) : null}
              {movie.sourceStatus === 'fallback' ? (
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
                  Fallback
                </span>
              ) : null}
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
                {movie.year ?? 'Ano N/D'}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-white md:text-5xl">{movie.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted md:text-lg">{movie.synopsis}</p>
            </div>

            {movie.sourceStatus === 'fallback' ? (
              <div className="rounded-[1.3rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                O TMDb falhou para este titulo. A pagina continua de pe com placeholders e metadados minimos.
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-muted">Duracao</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatDuration(movie.durationMinutes)}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-muted">Audio</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatAudioPreference(movie.audioPreference)}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-muted">Idiomas</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatList(movie.languages)}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-muted">Nota TMDb</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatRating(movie.voteAverage)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {movie.playback?.src ? (
                <a
                  href="#player"
                  className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-surface transition hover:bg-white"
                >
                  Assistir
                </a>
              ) : (
                <span className="cursor-not-allowed rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-surface opacity-70">
                  Em breve
                </span>
              )}
              <Link
                href="/filmes"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Voltar para filmes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-panel/70 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Ficha</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Detalhes do filme</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
              <p className="text-sm uppercase tracking-[0.16em] text-muted">Direcao</p>
              <p className="mt-2 text-base leading-7 text-white">{formatList(movie.creators, 'Direcao indisponivel')}</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
              <p className="text-sm uppercase tracking-[0.16em] text-muted">Pais</p>
              <p className="mt-2 text-base leading-7 text-white">{formatList(movie.countries)}</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
              <p className="text-sm uppercase tracking-[0.16em] text-muted">Adicionado em</p>
              <p className="mt-2 text-base leading-7 text-white">{formatDateLabel(movie.addedAt)}</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
              <p className="text-sm uppercase tracking-[0.16em] text-muted">Generos</p>
              <p className="mt-2 text-base leading-7 text-white">{formatList(movie.genres)}</p>
            </div>
          </div>

          {movie.cast.length ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
              <p className="text-sm uppercase tracking-[0.16em] text-muted">Elenco</p>
              <p className="mt-2 text-base leading-7 text-white">{movie.cast.join(', ')}</p>
            </div>
          ) : null}

          <div
            id="player"
            className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20 p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-muted">Player</p>
                <h3 className="mt-1 text-2xl font-semibold text-white">Teste de reproducao</h3>
              </div>
              {movie.playback?.src ? (
                <span className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-sm text-white/80">
                  {movie.playback.type === 'local' ? 'Arquivo local' : 'URL aberta'}
                </span>
              ) : null}
            </div>

            {movie.playback?.src ? (
              <video
                controls
                preload="metadata"
                playsInline
                poster={getPosterSrc(movie, 'w780')}
                className="aspect-video w-full rounded-[1.2rem] bg-black"
              >
                <source src={movie.playback.src} />
                Seu navegador nao suporta video HTML5.
              </video>
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-white/12 bg-black/20 px-4 py-8 text-center text-sm text-muted">
                Nenhum playback configurado para este filme. O botao Assistir fica como &quot;Em breve&quot; sem quebrar a UI.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-panel/70 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Tags</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Busca rapida</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {movie.tags.length ? (
              movie.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-sm text-white/85"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-sm text-white/60">
                Sem tags internas
              </span>
            )}
          </div>

          <div className="rounded-[1.4rem] border border-dashed border-white/12 bg-black/15 p-4">
            <p className="text-sm uppercase tracking-[0.16em] text-muted">TMDb</p>
            <p className="mt-2 text-base leading-7 text-white">
              Rota principal por ID: <code className="rounded bg-white/5 px-1.5 py-0.5">/filmes/{movie.id}</code>
            </p>
          </div>
        </aside>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Relacionados</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Mais filmes para continuar navegando</h2>
          </div>
          <Link href="/filmes" className="text-sm font-semibold text-white/80 transition hover:text-white">
            Abrir catalogo
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {relatedMovies.map((relatedMovie) => (
            <MovieCard key={relatedMovie.id} movie={relatedMovie} />
          ))}
        </div>
      </section>
    </div>
  );
}
