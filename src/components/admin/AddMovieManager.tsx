'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PosterImage } from '@/components/PosterImage';
import {
  buildTmdbImageUrl,
  formatAudioPreference,
  formatDateLabel,
  formatList,
  getMovieHref,
  getPosterSrc
} from '@/lib/movie-utils';
import type { Movie, MovieAudioPreference, PlaybackSource, TmdbMovieSearchResult } from '@/lib/types';

type AddMovieManagerProps = {
  initialMovies: Movie[];
};

type MovieDraft = {
  featured: boolean;
  audioPreference?: MovieAudioPreference;
  tags: string;
  playbackType: PlaybackSource['type'];
  playbackSrc: string;
};

function movieToDraft(movie: Movie): MovieDraft {
  return {
    featured: movie.featured,
    audioPreference: movie.audioPreference,
    tags: movie.tags.join(', '),
    playbackType: movie.playback?.type ?? 'url',
    playbackSrc: movie.playback?.src ?? ''
  };
}

function upsertMovie(items: Movie[], movie: Movie) {
  const nextItems = items.some((item) => item.id === movie.id)
    ? items.map((item) => (item.id === movie.id ? movie : item))
    : [movie, ...items];

  return nextItems.sort((left, right) => Date.parse(right.addedAt) - Date.parse(left.addedAt));
}

function tagsFromDraft(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export function AddMovieManager({ initialMovies }: AddMovieManagerProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [drafts, setDrafts] = useState<Record<string, MovieDraft>>(() =>
    Object.fromEntries(initialMovies.map((movie) => [movie.id, movieToDraft(movie)]))
  );
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [results, setResults] = useState<TmdbMovieSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const existingTmdbIds = useMemo(
    () => new Set(movies.map((movie) => String(movie.tmdbId ?? movie.id))),
    [movies]
  );

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setResults([]);
      setSearchError('Digite um titulo para buscar no TMDb.');
      return;
    }

    setSearching(true);
    setSearchError(null);
    setStatusMessage(null);

    try {
      const searchParams = new URLSearchParams({ q: normalizedQuery });
      if (year.trim()) {
        searchParams.set('year', year.trim());
      }

      const response = await fetch(`/api/tmdb/search?${searchParams.toString()}`);
      const payload = (await response.json()) as {
        ok: boolean;
        results: TmdbMovieSearchResult[];
        error?: string | null;
      };

      setResults(payload.results ?? []);
      setSearchError(payload.error ?? null);
    } catch (error) {
      setResults([]);
      setSearchError(error instanceof Error ? error.message : 'Nao foi possivel buscar agora.');
    } finally {
      setSearching(false);
    }
  }

  async function handleAddMovie(tmdbId: number) {
    setSavingId(String(tmdbId));
    setStatusMessage(null);

    try {
      const response = await fetch('/api/admin/add-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tmdbId })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        added: boolean;
        movie?: Movie;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.movie) {
        throw new Error(payload.error ?? 'Nao foi possivel adicionar o filme.');
      }

      setMovies((current) => upsertMovie(current, payload.movie as Movie));
      setDrafts((current) => ({
        ...current,
        [payload.movie!.id]: movieToDraft(payload.movie!)
      }));
      setStatusMessage(payload.added ? 'Filme adicionado ao dataset local.' : 'Filme ja estava no dataset local.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Nao foi possivel adicionar o filme.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleSaveMovie(movieId: string) {
    const draft = drafts[movieId];
    if (!draft) {
      return;
    }

    setSavingId(movieId);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/movie/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featured: draft.featured,
          audioPreference: draft.audioPreference,
          tags: tagsFromDraft(draft.tags),
          playback: draft.playbackSrc.trim()
            ? {
                type: draft.playbackType,
                src: draft.playbackSrc.trim()
              }
            : undefined
        })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        movie?: Movie;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.movie) {
        throw new Error(payload.error ?? 'Nao foi possivel salvar as preferencias.');
      }

      setMovies((current) => upsertMovie(current, payload.movie as Movie));
      setDrafts((current) => ({
        ...current,
        [payload.movie!.id]: movieToDraft(payload.movie!)
      }));
      setStatusMessage(`Preferencias salvas para ${payload.movie.title}.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar agora.');
    } finally {
      setSavingId(null);
    }
  }

  function updateDraft(movieId: string, patch: Partial<MovieDraft>) {
    setDrafts((current) => ({
      ...current,
      [movieId]: {
        ...current[movieId],
        ...patch
      }
    }));
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-panel/80 p-6 shadow-glow md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Admin dev-only</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">Adicionar filme via TMDb</h1>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              Busque um titulo, clique em adicionar e ajuste apenas as preferencias internas que o TMDb nao cobre.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <p className="text-3xl font-semibold text-white">{movies.length}</p>
              <p className="text-sm text-muted">filmes persistidos no JSON local</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <p className="text-3xl font-semibold text-white">
                {movies.filter((movie) => movie.playback?.src).length}
              </p>
              <p className="text-sm text-muted">com playback configurado</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-panel/70 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Busca</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Buscar no TMDb</h2>
          </div>

          <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto]" onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex: The Matrix"
              className="rounded-2xl border border-white/10 bg-surface-alt/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-accent/60"
            />
            <input
              value={year}
              onChange={(event) => setYear(event.target.value)}
              inputMode="numeric"
              placeholder="Ano (opcional)"
              className="rounded-2xl border border-white/10 bg-surface-alt/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-accent/60"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-2xl border border-accent/40 bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-surface transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching ? 'Buscando...' : 'Pesquisar'}
            </button>
          </form>

          {searchError ? (
            <div className="rounded-[1.4rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {searchError}
            </div>
          ) : null}

          {statusMessage ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90">
              {statusMessage}
            </div>
          ) : null}

          <div className="grid gap-4">
            {results.length ? (
              results.map((movie) => {
                const isAlreadyAdded = existingTmdbIds.has(String(movie.id));

                return (
                  <article
                    key={movie.id}
                    className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/15 p-4 md:grid-cols-[92px_minmax(0,1fr)_auto]"
                  >
                    <PosterImage
                      src={buildTmdbImageUrl(movie.posterPath, 'w342')}
                      alt={`Poster de ${movie.title}`}
                      className="aspect-[2/3] w-full rounded-[1.2rem] object-cover"
                    />

                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                      <p className="text-sm text-muted">
                        {movie.year ?? 'Ano N/D'} - TMDb #{movie.id}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={savingId === String(movie.id)}
                      onClick={() => handleAddMovie(movie.id)}
                      className={`h-fit rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition ${
                        isAlreadyAdded
                          ? 'border border-white/10 bg-white/5 text-white/70'
                          : 'border border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-surface'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {savingId === String(movie.id) ? 'Salvando...' : isAlreadyAdded ? 'Ja adicionado' : 'Adicionar'}
                    </button>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/10 px-4 py-10 text-center text-sm text-muted">
                Faça uma busca para listar resultados do TMDb.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-panel/70 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Como funciona</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Fluxo rapido</h2>
          </div>
          <ol className="space-y-3 text-sm leading-6 text-muted">
            <li>1. Pesquise por titulo e, se quiser, refine pelo ano.</li>
            <li>2. Clique em adicionar para gravar apenas o `tmdbId` e flags internas no JSON local.</li>
            <li>3. Ajuste destaque, tags, audio e playback sem tocar em `movies.ts`.</li>
            <li>4. Abra o filme em `/filmes/[id]` para ver os dados hidratados automaticamente.</li>
          </ol>
        </aside>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Dataset local</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Filmes persistidos</h2>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {movies.map((movie) => {
            const draft = drafts[movie.id] ?? movieToDraft(movie);

            return (
              <article
                key={movie.id}
                className="grid gap-4 rounded-[1.7rem] border border-white/10 bg-panel/65 p-5 md:grid-cols-[120px_minmax(0,1fr)]"
              >
                <PosterImage
                  src={getPosterSrc(movie)}
                  alt={`Poster de ${movie.title}`}
                  className="aspect-[2/3] w-full rounded-[1.2rem] object-cover"
                />

                <div className="space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{movie.title}</h3>
                      <p className="mt-1 text-sm text-muted">
                        TMDb #{movie.tmdbId ?? movie.id} - adicionado em {formatDateLabel(movie.addedAt)}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {formatList(movie.creators, 'Direcao indisponivel')} - {formatList(movie.countries)}
                      </p>
                    </div>

                    <Link
                      href={getMovieHref(movie)}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                    >
                      Abrir detalhe
                    </Link>
                  </div>

                  {movie.sourceStatus === 'fallback' ? (
                    <div className="rounded-[1.2rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                      O TMDb nao respondeu para este filme. A UI continua funcionando com fallback.
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="rounded-[1.2rem] border border-white/10 bg-black/15 p-4 text-sm text-white/85">
                      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted">Destaque</span>
                      <input
                        type="checkbox"
                        checked={draft.featured}
                        onChange={(event) => updateDraft(movie.id, { featured: event.target.checked })}
                        className="h-4 w-4 rounded border-white/20 bg-surface-alt accent-accent"
                      />
                    </label>

                    <label className="rounded-[1.2rem] border border-white/10 bg-black/15 p-4 text-sm text-white/85">
                      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted">
                        Preferencia de audio
                      </span>
                      <select
                        value={draft.audioPreference ?? ''}
                        onChange={(event) =>
                          updateDraft(movie.id, {
                            audioPreference: event.target.value
                              ? (event.target.value as MovieAudioPreference)
                              : undefined
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-surface-alt/80 px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
                      >
                        <option value="">Indefinido</option>
                        <option value="dubbed">Dublado</option>
                        <option value="subtitled">Legendado</option>
                        <option value="both">Ambos</option>
                      </select>
                    </label>

                    <label className="sm:col-span-2 rounded-[1.2rem] border border-white/10 bg-black/15 p-4 text-sm text-white/85">
                      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted">Tags internas</span>
                      <input
                        value={draft.tags}
                        onChange={(event) => updateDraft(movie.id, { tags: event.target.value })}
                        placeholder="cult, noir, ver depois"
                        className="w-full rounded-xl border border-white/10 bg-surface-alt/80 px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
                      />
                    </label>

                    <label className="rounded-[1.2rem] border border-white/10 bg-black/15 p-4 text-sm text-white/85">
                      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted">Playback</span>
                      <select
                        value={draft.playbackType}
                        onChange={(event) =>
                          updateDraft(movie.id, {
                            playbackType: event.target.value === 'local' ? 'local' : 'url'
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-surface-alt/80 px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
                      >
                        <option value="url">URL aberta</option>
                        <option value="local">Arquivo local</option>
                      </select>
                    </label>

                    <label className="rounded-[1.2rem] border border-white/10 bg-black/15 p-4 text-sm text-white/85">
                      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted">
                        Fonte do player
                      </span>
                      <input
                        value={draft.playbackSrc}
                        onChange={(event) => updateDraft(movie.id, { playbackSrc: event.target.value })}
                        placeholder="/videos/teste.mp4 ou https://..."
                        className="w-full rounded-xl border border-white/10 bg-surface-alt/80 px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={savingId === movie.id}
                      onClick={() => handleSaveMovie(movie.id)}
                      className="rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-accent transition hover:bg-accent hover:text-surface disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingId === movie.id ? 'Salvando...' : 'Salvar preferencias'}
                    </button>
                    <span className="text-sm text-muted">
                      Audio atual: {formatAudioPreference(movie.audioPreference)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
