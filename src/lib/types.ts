export const movieAudioOptions = ['dubbed', 'subtitled', 'both'] as const;
export const durationRanges = ['up-to-60', '60-90', '90-120', '120-plus'] as const;

export type MovieAudioPreference = (typeof movieAudioOptions)[number];
export type DurationRange = (typeof durationRanges)[number];

export type SortOption =
  | 'relevance'
  | 'latest'
  | 'popular'
  | 'rating-desc'
  | 'duration-asc'
  | 'duration-desc'
  | 'year-desc'
  | 'year-asc';

export type PlaybackSource = {
  type: 'url' | 'local';
  src: string;
};

export type StoredMovieRecord = {
  id: string;
  tmdbId?: number;
  featured?: boolean;
  addedAt?: string;
  tags?: string[];
  audioPreference?: MovieAudioPreference;
  languagePreference?: string;
  playback?: PlaybackSource;
};

export type Movie = {
  id: string;
  tmdbId?: number;
  title: string;
  year: number | null;
  releaseDate: string | null;
  durationMinutes: number | null;
  genres: string[];
  languages: string[];
  countries: string[];
  audioPreference?: MovieAudioPreference;
  languagePreference?: string;
  creators: string[];
  cast: string[];
  tags: string[];
  featured: boolean;
  addedAt: string;
  synopsis: string;
  posterPath: string | null;
  backdropPath: string | null;
  posterUrl?: string | null;
  popularity: number;
  voteAverage: number | null;
  playback?: PlaybackSource;
  sourceStatus: 'tmdb' | 'fallback';
};

export type MovieFilters = {
  genres: string[];
  audioPreferences: MovieAudioPreference[];
  duration: DurationRange | 'all';
  years: number[];
  creators: string[];
  countries: string[];
  languages: string[];
  tags: string[];
  featuredOnly: boolean;
  recentOnly: boolean;
};

export type MovieFilterOptions = {
  genres: string[];
  creators: string[];
  countries: string[];
  languages: string[];
  tags: string[];
  years: number[];
};

export type TmdbMovieSearchResult = {
  id: number;
  title: string;
  releaseDate: string | null;
  year: number | null;
  posterPath: string | null;
};
