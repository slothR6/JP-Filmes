import type { Movie, StoredMovieRecord, TmdbMovieSearchResult } from '@/lib/types';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const TMDB_REVALIDATE_SECONDS = 60 * 60 * 24;

type FetchTmdbOptions = {
  query?: Record<string, string | number | undefined>;
  tags?: string[];
};

type FetchTmdbResult<T> = {
  data: T | null;
  error: string | null;
};

type TmdbMovieDetailsResponse = {
  id: number;
  title: string;
  overview: string;
  runtime: number | null;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: Array<{ id: number; name: string }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ english_name: string; iso_639_1: string; name: string }>;
  popularity: number;
  vote_average: number;
};

type TmdbMovieCreditsResponse = {
  cast: Array<{ id: number; name: string }>;
  crew: Array<{ id: number; name: string; job: string }>;
};

type TmdbMovieBundleResponse = TmdbMovieDetailsResponse & {
  credits?: TmdbMovieCreditsResponse;
};

type TmdbSearchResponse = {
  results: Array<{
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
  }>;
};

export type TmdbMovieDetails = {
  id: number;
  title: string;
  overview: string;
  runtime: number | null;
  releaseDate: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  genres: string[];
  countries: string[];
  languages: string[];
  popularity: number;
  voteAverage: number | null;
};

export type TmdbMovieCredits = {
  cast: string[];
  directors: string[];
};

function getTmdbToken() {
  return process.env.TMDB_READ_ACCESS_TOKEN?.trim() ?? '';
}

function getReleaseYear(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function mapMovieDetails(payload: TmdbMovieDetailsResponse): TmdbMovieDetails {
  return {
    id: payload.id,
    title: payload.title,
    overview: payload.overview?.trim() ?? '',
    runtime: payload.runtime ?? null,
    releaseDate: payload.release_date || null,
    posterPath: payload.poster_path ?? null,
    backdropPath: payload.backdrop_path ?? null,
    genres: uniqueStrings(payload.genres?.map((genre) => genre.name) ?? []),
    countries: uniqueStrings(payload.production_countries?.map((country) => country.name) ?? []),
    languages: uniqueStrings(
      payload.spoken_languages?.map((language) => language.name || language.english_name || language.iso_639_1) ?? []
    ),
    popularity: typeof payload.popularity === 'number' ? payload.popularity : 0,
    voteAverage: typeof payload.vote_average === 'number' ? payload.vote_average : null
  };
}

function mapMovieCredits(payload: TmdbMovieCreditsResponse | undefined): TmdbMovieCredits {
  if (!payload) {
    return { cast: [], directors: [] };
  }

  return {
    cast: uniqueStrings(payload.cast?.slice(0, 6).map((member) => member.name) ?? []),
    directors: uniqueStrings(
      payload.crew
        ?.filter((member) => member.job === 'Director')
        .slice(0, 2)
        .map((member) => member.name) ?? []
    )
  };
}

async function fetchTmdb<T>(pathname: string, options: FetchTmdbOptions = {}): Promise<FetchTmdbResult<T>> {
  const token = getTmdbToken();

  if (!token) {
    return {
      data: null,
      error: 'TMDB_READ_ACCESS_TOKEN is not configured.'
    };
  }

  const normalizedPathname = pathname.replace(/^\/+/, '');
  const url = new URL(normalizedPathname, `${TMDB_API_BASE_URL}/`);
  const query = options.query ?? {};

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      next: {
        revalidate: TMDB_REVALIDATE_SECONDS,
        tags: ['tmdb', ...(options.tags ?? [])]
      }
    });

    if (!response.ok) {
      return {
        data: null,
        error: `TMDb returned ${response.status} ${response.statusText}.`
      };
    }

    return {
      data: (await response.json()) as T,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown TMDb error.'
    };
  }
}

export function buildTmdbImageUrl(pathname: string | null | undefined, size = 'w500') {
  if (!pathname) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${pathname}`;
}

export async function getTmdbMovieDetails(movieId: number) {
  const result = await fetchTmdb<TmdbMovieDetailsResponse>(`/movie/${movieId}`, {
    query: {
      language: 'pt-BR'
    },
    tags: [`tmdb-movie-${movieId}`]
  });

  return {
    data: result.data ? mapMovieDetails(result.data) : null,
    error: result.error
  };
}

export async function getTmdbMovieCredits(movieId: number) {
  const result = await fetchTmdb<TmdbMovieCreditsResponse>(`/movie/${movieId}/credits`, {
    query: {
      language: 'pt-BR'
    },
    tags: [`tmdb-credits-${movieId}`]
  });

  return {
    data: mapMovieCredits(result.data ?? undefined),
    error: result.error
  };
}

export async function getTmdbMovieBundle(movieId: number) {
  const result = await fetchTmdb<TmdbMovieBundleResponse>(`/movie/${movieId}`, {
    query: {
      language: 'pt-BR',
      append_to_response: 'credits'
    },
    tags: [`tmdb-movie-${movieId}`, `tmdb-credits-${movieId}`]
  });

  if (!result.data) {
    return {
      details: null,
      credits: mapMovieCredits(undefined),
      error: result.error
    };
  }

  return {
    details: mapMovieDetails(result.data),
    credits: mapMovieCredits(result.data.credits),
    error: result.error
  };
}

export async function searchTmdbMovies(query: string, year?: number | null) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      results: [] as TmdbMovieSearchResult[],
      error: 'Search query is required.'
    };
  }

  const result = await fetchTmdb<TmdbSearchResponse>('/search/movie', {
    query: {
      include_adult: 'false',
      language: 'pt-BR',
      query: normalizedQuery,
      year: year ?? undefined
    },
    tags: ['tmdb-search']
  });

  return {
    results:
      result.data?.results.slice(0, 10).map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseDate: movie.release_date || null,
        year: getReleaseYear(movie.release_date),
        posterPath: movie.poster_path ?? null
      })) ?? [],
    error: result.error
  };
}

export function buildHydratedMovieFallback(record: StoredMovieRecord): Movie {
  const tmdbId = record.tmdbId;

  return {
    id: record.id,
    tmdbId,
    title: tmdbId ? `Filme ${tmdbId}` : `Filme ${record.id}`,
    year: null,
    releaseDate: null,
    durationMinutes: null,
    genres: [],
    languages: [],
    countries: [],
    audioPreference: record.audioPreference,
    languagePreference: record.languagePreference,
    creators: [],
    cast: [],
    tags: record.tags ?? [],
    featured: Boolean(record.featured),
    addedAt: record.addedAt ?? new Date().toISOString(),
    synopsis: 'Nao foi possivel carregar os dados do TMDb agora.',
    posterPath: null,
    backdropPath: null,
    posterUrl: null,
    popularity: 0,
    voteAverage: null,
    playback: record.playback,
    sourceStatus: 'fallback'
  };
}

export async function hydrateMovieRecord(record: StoredMovieRecord): Promise<Movie> {
  if (!record.tmdbId) {
    return buildHydratedMovieFallback(record);
  }

  const { details, credits, error } = await getTmdbMovieBundle(record.tmdbId);

  if (!details) {
    return buildHydratedMovieFallback(record);
  }

  return {
    id: record.id,
    tmdbId: record.tmdbId,
    title: details.title,
    year: getReleaseYear(details.releaseDate),
    releaseDate: details.releaseDate,
    durationMinutes: details.runtime,
    genres: details.genres,
    languages: details.languages,
    countries: details.countries,
    audioPreference: record.audioPreference,
    languagePreference: record.languagePreference,
    creators: credits.directors,
    cast: credits.cast,
    tags: record.tags ?? [],
    featured: Boolean(record.featured),
    addedAt: record.addedAt ?? new Date().toISOString(),
    synopsis: details.overview || 'Sinopse indisponivel no momento.',
    posterPath: details.posterPath,
    backdropPath: details.backdropPath,
    posterUrl: null,
    popularity: details.popularity,
    voteAverage: details.voteAverage,
    playback: record.playback,
    sourceStatus: error ? 'fallback' : 'tmdb'
  };
}
