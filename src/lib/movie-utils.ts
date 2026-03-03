import type {
  DurationRange,
  Movie,
  MovieAudioPreference,
  MovieFilterOptions,
  MovieFilters,
  SortOption
} from '@/lib/types';

const collator = new Intl.Collator('pt-BR');
const dayMs = 24 * 60 * 60 * 1000;
const posterPlaceholder = '/placeholders/poster.jpg';
const tmdbImageBaseUrl = 'https://image.tmdb.org/t/p';

export const defaultMovieFilters: MovieFilters = {
  genres: [],
  audioPreferences: [],
  duration: 'all',
  years: [],
  creators: [],
  countries: [],
  languages: [],
  tags: [],
  featuredOnly: false,
  recentOnly: false
};

export const durationOptions: { value: DurationRange; label: string }[] = [
  { value: 'up-to-60', label: 'Ate 60 min' },
  { value: '60-90', label: '60 a 90 min' },
  { value: '90-120', label: '90 a 120 min' },
  { value: '120-plus', label: '120+ min' }
];

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'latest', label: 'Mais recentes' },
  { value: 'popular', label: 'Mais populares' },
  { value: 'rating-desc', label: 'Melhor nota' },
  { value: 'duration-asc', label: 'Duracao menor' },
  { value: 'duration-desc', label: 'Duracao maior' },
  { value: 'year-desc', label: 'Ano mais novo' },
  { value: 'year-asc', label: 'Ano mais antigo' }
];

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function sortByAddedAtDesc(left: Movie, right: Movie) {
  return Date.parse(right.addedAt) - Date.parse(left.addedAt);
}

function getNumericValue(value: number | null | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function buildMovieFilterOptions(movies: Movie[]): MovieFilterOptions {
  return {
    genres: unique(movies.flatMap((movie) => movie.genres)).sort(collator.compare),
    creators: unique(movies.flatMap((movie) => movie.creators)).sort(collator.compare),
    countries: unique(movies.flatMap((movie) => movie.countries)).sort(collator.compare),
    languages: unique(movies.flatMap((movie) => movie.languages)).sort(collator.compare),
    tags: unique(movies.flatMap((movie) => movie.tags)).sort(collator.compare),
    years: unique(movies.map((movie) => movie.year).filter((year): year is number => year !== null)).sort(
      (left, right) => right - left
    )
  };
}

export function getFeaturedMovies(movies: Movie[]) {
  return [...movies]
    .filter((movie) => movie.featured)
    .sort((left, right) => right.popularity - left.popularity || sortByAddedAtDesc(left, right));
}

export function getRecentMovies(movies: Movie[]) {
  return [...movies].filter(isMovieRecentlyAdded).sort(sortByAddedAtDesc);
}

export function getRecommendedMovies(movies: Movie[]) {
  return [...movies].sort((left, right) => {
    const popularityDelta = right.popularity - left.popularity;
    if (popularityDelta) {
      return popularityDelta;
    }

    const ratingDelta = getNumericValue(right.voteAverage) - getNumericValue(left.voteAverage);
    if (ratingDelta) {
      return ratingDelta;
    }

    return sortByAddedAtDesc(left, right);
  });
}

export function buildTmdbImageUrl(pathname: string | null | undefined, size = 'w500') {
  if (!pathname) {
    return null;
  }

  return `${tmdbImageBaseUrl}/${size}${pathname}`;
}

export function getPosterSrc(movie: Pick<Movie, 'posterUrl' | 'posterPath'>, size = 'w500') {
  if (movie.posterUrl) {
    return movie.posterUrl;
  }

  return buildTmdbImageUrl(movie.posterPath, size) ?? posterPlaceholder;
}

export function getBackdropSrc(movie: Pick<Movie, 'backdropPath'>, size = 'w1280') {
  return buildTmdbImageUrl(movie.backdropPath, size);
}

export function getMovieHref(movie: Pick<Movie, 'id'>) {
  return `/filmes/${movie.id}`;
}

export function isMovieRecentlyAdded(movie: Movie) {
  return Date.parse(movie.addedAt) >= Date.now() - 45 * dayMs;
}

export function isWithinDurationRange(durationMinutes: number | null, range: DurationRange) {
  if (durationMinutes === null) {
    return false;
  }

  switch (range) {
    case 'up-to-60':
      return durationMinutes <= 60;
    case '60-90':
      return durationMinutes > 60 && durationMinutes <= 90;
    case '90-120':
      return durationMinutes > 90 && durationMinutes <= 120;
    case '120-plus':
      return durationMinutes > 120;
    default:
      return true;
  }
}

export function formatDuration(durationMinutes: number | null) {
  if (durationMinutes === null) {
    return 'N/D';
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (!hours) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
}

export function formatAudioPreference(audioPreference?: MovieAudioPreference) {
  switch (audioPreference) {
    case 'dubbed':
      return 'Dublado';
    case 'subtitled':
      return 'Legendado';
    case 'both':
      return 'Dublado e legendado';
    default:
      return 'Indefinido';
  }
}

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
}

export function formatRating(voteAverage: number | null) {
  if (voteAverage === null) {
    return 'N/D';
  }

  return voteAverage.toFixed(1);
}

export function formatList(values: string[], fallback = 'N/D') {
  return values.length ? values.join(', ') : fallback;
}

const buildSearchText = (movie: Movie) =>
  [
    movie.title,
    movie.synopsis,
    ...movie.genres,
    ...movie.creators,
    ...movie.cast,
    ...movie.tags,
    ...movie.languages,
    ...movie.countries
  ]
    .join(' ')
    .toLowerCase();

const scoreMovie = (movie: Movie, rawTerm: string) => {
  const term = rawTerm.trim().toLowerCase();

  if (!term) {
    return (
      movie.popularity +
      getNumericValue(movie.voteAverage) * 5 +
      (movie.featured ? 16 : 0) +
      (isMovieRecentlyAdded(movie) ? 10 : 0) +
      getNumericValue(movie.year, 0) / 200
    );
  }

  let score = 0;
  const title = movie.title.toLowerCase();
  const creators = movie.creators.join(' ').toLowerCase();
  const genres = movie.genres.join(' ').toLowerCase();
  const tags = movie.tags.join(' ').toLowerCase();
  const searchableText = buildSearchText(movie);

  if (title.startsWith(term)) score += 42;
  if (title.includes(term)) score += 28;
  if (creators.includes(term)) score += 18;
  if (tags.includes(term)) score += 14;
  if (genres.includes(term)) score += 10;
  if (searchableText.includes(term)) score += 6;
  if (movie.featured) score += 8;
  if (isMovieRecentlyAdded(movie)) score += 5;

  return score + movie.popularity / 10 + getNumericValue(movie.voteAverage) / 2;
};

export function filterMovies(moviesToFilter: Movie[], filters: MovieFilters, searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return moviesToFilter.filter((movie) => {
    const matchesSearch = !normalizedSearch || buildSearchText(movie).includes(normalizedSearch);
    const matchesGenres = !filters.genres.length || filters.genres.some((genre) => movie.genres.includes(genre));
    const matchesAudio =
      !filters.audioPreferences.length ||
      (movie.audioPreference ? filters.audioPreferences.includes(movie.audioPreference) : false);
    const matchesDuration = filters.duration === 'all' || isWithinDurationRange(movie.durationMinutes, filters.duration);
    const matchesYears = !filters.years.length || (movie.year !== null && filters.years.includes(movie.year));
    const matchesCreators =
      !filters.creators.length || filters.creators.some((creator) => movie.creators.includes(creator));
    const matchesCountries =
      !filters.countries.length || filters.countries.some((country) => movie.countries.includes(country));
    const matchesLanguages =
      !filters.languages.length || filters.languages.some((language) => movie.languages.includes(language));
    const matchesTags = !filters.tags.length || filters.tags.some((tag) => movie.tags.includes(tag));
    const matchesFeatured = !filters.featuredOnly || movie.featured;
    const matchesRecent = !filters.recentOnly || isMovieRecentlyAdded(movie);

    return (
      matchesSearch &&
      matchesGenres &&
      matchesAudio &&
      matchesDuration &&
      matchesYears &&
      matchesCreators &&
      matchesCountries &&
      matchesLanguages &&
      matchesTags &&
      matchesFeatured &&
      matchesRecent
    );
  });
}

export function sortMovies(moviesToSort: Movie[], sort: SortOption, searchTerm: string) {
  return [...moviesToSort].sort((left, right) => {
    switch (sort) {
      case 'latest':
        return sortByAddedAtDesc(left, right);
      case 'popular':
        return right.popularity - left.popularity || sortByAddedAtDesc(left, right);
      case 'rating-desc':
        return getNumericValue(right.voteAverage) - getNumericValue(left.voteAverage) || right.popularity - left.popularity;
      case 'duration-asc':
        return getNumericValue(left.durationMinutes, Number.MAX_SAFE_INTEGER) - getNumericValue(right.durationMinutes, Number.MAX_SAFE_INTEGER);
      case 'duration-desc':
        return getNumericValue(right.durationMinutes, -1) - getNumericValue(left.durationMinutes, -1);
      case 'year-desc':
        return getNumericValue(right.year, -1) - getNumericValue(left.year, -1);
      case 'year-asc':
        return getNumericValue(left.year, Number.MAX_SAFE_INTEGER) - getNumericValue(right.year, Number.MAX_SAFE_INTEGER);
      case 'relevance':
      default:
        return scoreMovie(right, searchTerm) - scoreMovie(left, searchTerm);
    }
  });
}

export function getRelatedMovies(movie: Movie, movies: Movie[]) {
  return movies
    .filter((candidate) => candidate.id !== movie.id)
    .map((candidate) => {
      let score = 0;

      if (candidate.creators.some((creator) => movie.creators.includes(creator))) score += 18;
      if (candidate.genres.some((genre) => movie.genres.includes(genre))) score += 12;
      if (candidate.tags.some((tag) => movie.tags.includes(tag))) score += 8;
      if (candidate.countries.some((country) => movie.countries.includes(country))) score += 4;

      return { candidate, score };
    })
    .sort((left, right) => right.score - left.score || right.candidate.popularity - left.candidate.popularity)
    .map(({ candidate }) => candidate);
}
