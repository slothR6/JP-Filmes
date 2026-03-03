'use client';

import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildMovieFilterOptions,
  defaultMovieFilters,
  durationOptions,
  filterMovies,
  formatDateLabel,
  getRecentMovies,
  sortMovies,
  sortOptions
} from '@/lib/movie-utils';
import type { Movie, MovieAudioPreference, MovieFilters, SortOption } from '@/lib/types';
import { MovieCard } from '@/components/MovieCard';

const pageSize = 24;
type ArrayFilterKey = 'genres' | 'audioPreferences' | 'years' | 'creators' | 'countries' | 'languages' | 'tags';

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-panel/50">
          <div className="aspect-[2/3] animate-pulse bg-white/5" />
          <div className="space-y-3 p-4">
            <div className="h-5 animate-pulse rounded-full bg-white/5" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/5" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

type FilterPanelProps = {
  movies: Movie[];
  filters: MovieFilters;
  query: string;
  creatorInput: string;
  sort: SortOption;
  resultCount: number;
  onQueryChange: (value: string) => void;
  onCreatorInputChange: (value: string) => void;
  onToggle: (key: ArrayFilterKey, value: string | number) => void;
  onDurationChange: (value: MovieFilters['duration']) => void;
  onToggleFlag: (key: 'featuredOnly' | 'recentOnly') => void;
  onSortChange: (value: SortOption) => void;
  onReset: () => void;
  onAddCreator: (value: string) => void;
};

function FilterPanel({
  movies,
  filters,
  query,
  creatorInput,
  sort,
  resultCount,
  onQueryChange,
  onCreatorInputChange,
  onToggle,
  onDurationChange,
  onToggleFlag,
  onSortChange,
  onReset,
  onAddCreator
}: FilterPanelProps) {
  const options = useMemo(() => buildMovieFilterOptions(movies), [movies]);
  const creatorSuggestions = creatorInput
    ? options.creators
        .filter(
          (creator) =>
            creator.toLowerCase().includes(creatorInput.toLowerCase()) && !filters.creators.includes(creator)
        )
        .slice(0, 6)
    : options.creators.filter((creator) => !filters.creators.includes(creator)).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <label className="mb-2 block text-sm font-semibold text-white" htmlFor="movie-search">
          Buscar
        </label>
        <input
          id="movie-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Titulo, sinopse, genero, diretor ou tag"
          className="w-full rounded-2xl border border-white/10 bg-surface-alt/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-accent/60"
        />
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>{resultCount} resultados</span>
          <button type="button" onClick={onReset} className="font-medium text-accent transition hover:text-white">
            Limpar tudo
          </button>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <label className="mb-2 block text-sm font-semibold text-white" htmlFor="movie-sort">
          Ordenar
        </label>
        <select
          id="movie-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className="w-full rounded-2xl border border-white/10 bg-surface-alt/80 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <section className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Generos</h2>
          <span className="text-xs text-muted">{filters.genres.length || 'Todos'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => onToggle('genres', genre)}
              className={`rounded-full border px-3 py-2 text-sm transition ${
                filters.genres.includes(genre)
                  ? 'border-accent bg-accent text-surface'
                  : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Audio</h2>
          <span className="text-xs text-muted">{filters.audioPreferences.length || 'Todos'}</span>
        </div>
        <div className="space-y-2">
          {[
            { value: 'dubbed', label: 'Dublado' },
            { value: 'subtitled', label: 'Legendado' },
            { value: 'both', label: 'Ambos' }
          ].map((audioOption) => (
            <label
              key={audioOption.value}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85"
            >
              <input
                type="checkbox"
                checked={filters.audioPreferences.includes(audioOption.value as MovieAudioPreference)}
                onChange={() => onToggle('audioPreferences', audioOption.value)}
                className="h-4 w-4 rounded border-white/20 bg-surface-alt accent-accent"
              />
              <span>{audioOption.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Duracao</h2>
          <span className="text-xs text-muted">{filters.duration === 'all' ? 'Livre' : '1 ativa'}</span>
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onDurationChange('all')}
            className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${
              filters.duration === 'all'
                ? 'border-accent bg-accent text-surface'
                : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25'
            }`}
          >
            Qualquer duracao
          </button>
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onDurationChange(option.value)}
              className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${
                filters.duration === option.value
                  ? 'border-accent bg-accent text-surface'
                  : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Ano</h2>
          <span className="text-xs text-muted">{filters.years.length || 'Todos'}</span>
        </div>
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {options.years.map((year) => (
            <label
              key={year}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85"
            >
              <input
                type="checkbox"
                checked={filters.years.includes(year)}
                onChange={() => onToggle('years', year)}
                className="h-4 w-4 rounded border-white/20 bg-surface-alt accent-accent"
              />
              <span>{year}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Direcao</h2>
          <span className="text-xs text-muted">{filters.creators.length || 'Todos'}</span>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={creatorInput}
              onChange={(event) => onCreatorInputChange(event.target.value)}
              placeholder="Ex: Quentin Tarantino"
              className="w-full rounded-2xl border border-white/10 bg-surface-alt/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-accent/60"
            />
            <button
              type="button"
              onClick={() => onAddCreator(creatorInput)}
              className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent hover:text-surface"
            >
              Adicionar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.creators.map((creator) => (
              <button
                key={creator}
                type="button"
                onClick={() => onToggle('creators', creator)}
                className="rounded-full border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent"
              >
                {creator} x
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {creatorSuggestions.map((creator) => (
              <button
                key={creator}
                type="button"
                onClick={() => onAddCreator(creator)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:border-white/25"
              >
                {creator}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Pais e idioma</h2>
          <span className="text-xs text-muted">
            {filters.countries.length + filters.languages.length || 'Todos'}
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {options.countries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => onToggle('countries', country)}
                className={`rounded-full border px-3 py-2 text-sm transition ${
                  filters.countries.includes(country)
                    ? 'border-accent bg-accent text-surface'
                    : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {options.languages.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => onToggle('languages', language)}
                className={`rounded-full border px-3 py-2 text-sm transition ${
                  filters.languages.includes(language)
                    ? 'border-accent bg-accent text-surface'
                    : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25'
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Tags internas</h2>
          <span className="text-xs text-muted">{filters.tags.length || 'Todas'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle('tags', tag)}
              className={`rounded-full border px-3 py-2 text-sm transition ${
                filters.tags.includes(tag)
                  ? 'border-accent bg-accent text-surface'
                  : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-white/10 bg-panel/75 p-5">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onToggleFlag('featuredOnly')}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
              filters.featuredOnly
                ? 'border-accent bg-accent text-surface'
                : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25'
            }`}
          >
            <span>Somente destaque</span>
            <span>{filters.featuredOnly ? 'On' : 'Off'}</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleFlag('recentOnly')}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
              filters.recentOnly
                ? 'border-accent bg-accent text-surface'
                : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25'
            }`}
          >
            <span>Somente recentes</span>
            <span>{filters.recentOnly ? 'On' : 'Off'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}

type CatalogPageProps = {
  movies: Movie[];
};

export function CatalogPage({ movies }: CatalogPageProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<MovieFilters>(defaultMovieFilters);
  const [creatorInput, setCreatorInput] = useState('');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const hasRenderedOnce = useRef(false);
  const stableQuery = useDeferredValue(debouncedQuery);
  const options = useMemo(() => buildMovieFilterOptions(movies), [movies]);
  const recentMovies = useMemo(() => getRecentMovies(movies), [movies]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 220);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const filtersSignature = JSON.stringify(filters);

  useEffect(() => {
    if (!hasRenderedOnce.current) {
      hasRenderedOnce.current = true;
      return;
    }

    const showTimer = window.setTimeout(() => setShowSkeleton(true), 0);
    const hideTimer = window.setTimeout(() => setShowSkeleton(false), 160);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [stableQuery, filtersSignature, sort]);

  useEffect(() => {
    startTransition(() => setPage(1));
  }, [stableQuery, filtersSignature, sort]);

  const filteredMovies = useMemo(
    () => sortMovies(filterMovies(movies, filters, stableQuery), sort, stableQuery),
    [filters, movies, sort, stableQuery]
  );
  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleMovies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMovies.slice(start, start + pageSize);
  }, [currentPage, filteredMovies]);

  const toggleArrayFilter = (key: ArrayFilterKey, value: string | number) => {
    setFilters((current) => {
      const values = current[key] as Array<string | number>;
      const nextValues = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

      return {
        ...current,
        [key]: nextValues
      } as MovieFilters;
    });
  };

  const resetFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setCreatorInput('');
    setSort('relevance');
    setFilters(defaultMovieFilters);
  };

  const addCreator = (value: string) => {
    const nextCreator = value.trim();
    if (!nextCreator || !options.creators.includes(nextCreator) || filters.creators.includes(nextCreator)) {
      return;
    }

    toggleArrayFilter('creators', nextCreator);
    setCreatorInput('');
  };

  const appliedFilters = [
    ...filters.genres.map((genre) => ({
      key: `genre-${genre}`,
      label: genre,
      onRemove: () => toggleArrayFilter('genres', genre)
    })),
    ...filters.audioPreferences.map((audio) => ({
      key: `audio-${audio}`,
      label: audio === 'dubbed' ? 'Dublado' : audio === 'subtitled' ? 'Legendado' : 'Ambos',
      onRemove: () => toggleArrayFilter('audioPreferences', audio)
    })),
    ...(filters.duration === 'all'
      ? []
      : [
          {
            key: 'duration',
            label: durationOptions.find((option) => option.value === filters.duration)?.label ?? filters.duration,
            onRemove: () => setFilters((current) => ({ ...current, duration: 'all' }))
          }
        ]),
    ...filters.years.map((year) => ({
      key: `year-${year}`,
      label: String(year),
      onRemove: () => toggleArrayFilter('years', year)
    })),
    ...filters.creators.map((creator) => ({
      key: `creator-${creator}`,
      label: creator,
      onRemove: () => toggleArrayFilter('creators', creator)
    })),
    ...filters.countries.map((country) => ({
      key: `country-${country}`,
      label: country,
      onRemove: () => toggleArrayFilter('countries', country)
    })),
    ...filters.languages.map((language) => ({
      key: `language-${language}`,
      label: language,
      onRemove: () => toggleArrayFilter('languages', language)
    })),
    ...filters.tags.map((tag) => ({
      key: `tag-${tag}`,
      label: tag,
      onRemove: () => toggleArrayFilter('tags', tag)
    })),
    ...(filters.featuredOnly
      ? [
          {
            key: 'featured',
            label: 'Somente destaque',
            onRemove: () => setFilters((current) => ({ ...current, featuredOnly: false }))
          }
        ]
      : []),
    ...(filters.recentOnly
      ? [
          {
            key: 'recent',
            label: 'Somente recentes',
            onRemove: () => setFilters((current) => ({ ...current, recentOnly: false }))
          }
        ]
      : []),
    ...(stableQuery
      ? [
          {
            key: 'query',
            label: `Busca: ${stableQuery}`,
            onRemove: () => setQuery('')
          }
        ]
      : [])
  ];

  const firstItem = filteredMovies.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(currentPage * pageSize, filteredMovies.length);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-panel/80 p-6 shadow-glow md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Catalogo automatico</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Filmes hidratados automaticamente pelo TMDb.
            </h1>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              Busque, filtre e abra detalhes sem preencher poster, sinopse, ano, duracao ou direcao manualmente.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <p className="text-3xl font-semibold text-white">{movies.length}</p>
              <p className="text-sm text-muted">filmes no dataset local</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <p className="text-3xl font-semibold text-white">{recentMovies.length}</p>
              <p className="text-sm text-muted">adicionados recentemente</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 xl:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-full border border-white/10 bg-panel/70 px-4 py-3 text-sm font-semibold text-white"
        >
          Abrir filtros
        </button>
        <div className="text-sm text-muted">
          {filteredMovies.length} resultados - {firstItem}-{lastItem}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <FilterPanel
            movies={movies}
            filters={filters}
            query={query}
            creatorInput={creatorInput}
            sort={sort}
            resultCount={filteredMovies.length}
            onQueryChange={setQuery}
            onCreatorInputChange={setCreatorInput}
            onToggle={toggleArrayFilter}
            onDurationChange={(value) => setFilters((current) => ({ ...current, duration: value }))}
            onToggleFlag={(key) => setFilters((current) => ({ ...current, [key]: !current[key] }))}
            onSortChange={setSort}
            onReset={resetFilters}
            onAddCreator={addCreator}
          />
        </aside>

        <section className="space-y-6">
          <div className="rounded-[1.6rem] border border-white/10 bg-panel/60 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Resultados</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{filteredMovies.length} filmes encontrados</h2>
                <p className="mt-1 text-sm text-muted">
                  Exibindo {firstItem} a {lastItem} - atualizado em {formatDateLabel(new Date().toISOString())}
                </p>
              </div>
              <div className="hidden xl:block">
                <label className="mb-2 block text-sm font-semibold text-white" htmlFor="sort-inline">
                  Ordenacao
                </label>
                <select
                  id="sort-inline"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className="rounded-2xl border border-white/10 bg-surface-alt/80 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {appliedFilters.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {appliedFilters.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="rounded-full border border-accent/35 bg-accent/10 px-3 py-2 text-sm text-accent transition hover:bg-accent hover:text-surface"
                  >
                    {chip.label} x
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {showSkeleton ? (
            <SkeletonGrid />
          ) : visibleMovies.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleMovies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} priority={currentPage === 1 && index < 4} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-white/15 bg-panel/45 px-6 py-14 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Sem resultados</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">Nada bateu com esses filtros.</h3>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted">
                Tente remover alguns filtros, trocar o termo de busca ou voltar para a ordenacao por relevancia.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-semibold text-accent transition hover:bg-accent hover:text-surface"
              >
                Limpar e recomeçar
              </button>
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Paginacao">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-full border border-white/10 bg-panel/70 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    pageNumber === currentPage
                      ? 'border-accent bg-accent text-surface'
                      : 'border-white/10 bg-panel/70 text-white hover:border-white/30'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-full border border-white/10 bg-panel/70 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Proxima
              </button>
            </nav>
          ) : null}
        </section>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawerOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-full max-w-md overflow-y-auto border-r border-white/10 bg-surface px-4 py-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Filtros</p>
                <h2 className="text-2xl font-semibold text-white">Ajuste o catalogo</h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white"
              >
                Fechar
              </button>
            </div>
            <FilterPanel
              movies={movies}
              filters={filters}
              query={query}
              creatorInput={creatorInput}
              sort={sort}
              resultCount={filteredMovies.length}
              onQueryChange={setQuery}
              onCreatorInputChange={setCreatorInput}
              onToggle={toggleArrayFilter}
              onDurationChange={(value) => setFilters((current) => ({ ...current, duration: value }))}
              onToggleFlag={(key) => setFilters((current) => ({ ...current, [key]: !current[key] }))}
              onSortChange={setSort}
              onReset={resetFilters}
              onAddCreator={addCreator}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
