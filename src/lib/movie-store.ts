import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { MovieAudioPreference, PlaybackSource, StoredMovieRecord } from '@/lib/types';

const moviesFilePath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const validAudioPreferences = new Set<MovieAudioPreference>(['dubbed', 'subtitled', 'both']);

function normalizeId(id: unknown) {
  return String(id ?? '').trim();
}

function normalizeTags(tags: unknown) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return Array.from(
    new Set(
      tags
        .map((tag) => String(tag ?? '').trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function normalizeAudioPreference(value: unknown): MovieAudioPreference | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return validAudioPreferences.has(value as MovieAudioPreference) ? (value as MovieAudioPreference) : undefined;
}

function normalizePlayback(value: unknown): PlaybackSource | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as Partial<PlaybackSource>;
  if (!candidate.src || typeof candidate.src !== 'string') {
    return undefined;
  }

  const type = candidate.type === 'local' ? 'local' : 'url';

  return {
    type,
    src: candidate.src.trim()
  };
}

function normalizeIsoDate(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

export function sanitizeStoredMovieRecord(input: Partial<StoredMovieRecord>): StoredMovieRecord {
  const fallbackTimestamp = new Date().toISOString();
  const id = normalizeId(input.id ?? input.tmdbId);

  if (!id) {
    throw new Error('Movie id is required.');
  }

  const tmdbId =
    typeof input.tmdbId === 'number' && Number.isFinite(input.tmdbId) && input.tmdbId > 0
      ? Math.trunc(input.tmdbId)
      : undefined;

  const languagePreference =
    typeof input.languagePreference === 'string' && input.languagePreference.trim()
      ? input.languagePreference.trim()
      : undefined;

  return {
    id,
    tmdbId,
    featured: Boolean(input.featured),
    addedAt: normalizeIsoDate(input.addedAt, fallbackTimestamp),
    tags: normalizeTags(input.tags),
    audioPreference: normalizeAudioPreference(input.audioPreference),
    languagePreference,
    playback: normalizePlayback(input.playback)
  };
}

export async function readStoredMovies(): Promise<StoredMovieRecord[]> {
  try {
    const raw = await fs.readFile(moviesFilePath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((record) => {
        try {
          return sanitizeStoredMovieRecord(record as Partial<StoredMovieRecord>);
        } catch {
          return null;
        }
      })
      .filter((record): record is StoredMovieRecord => Boolean(record));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export async function writeStoredMovies(records: StoredMovieRecord[]) {
  const sanitized = records.map((record) => sanitizeStoredMovieRecord(record));
  await fs.writeFile(moviesFilePath, `${JSON.stringify(sanitized, null, 2)}\n`, 'utf-8');
}

export async function addStoredMovie(tmdbId: number) {
  const records = await readStoredMovies();
  const existingRecord = records.find((record) => record.tmdbId === tmdbId || record.id === String(tmdbId));

  if (existingRecord) {
    return { added: false, record: existingRecord };
  }

  const record = sanitizeStoredMovieRecord({
    id: String(tmdbId),
    tmdbId,
    addedAt: new Date().toISOString(),
    featured: false,
    tags: []
  });

  await writeStoredMovies([record, ...records]);

  return { added: true, record };
}

export async function updateStoredMovie(id: string, updates: Partial<StoredMovieRecord>) {
  const records = await readStoredMovies();
  const index = records.findIndex((record) => record.id === id);

  if (index === -1) {
    return null;
  }

  const currentRecord = records[index];
  const updatedRecord = sanitizeStoredMovieRecord({
    ...currentRecord,
    ...updates,
    id: currentRecord.id,
    tmdbId: updates.tmdbId ?? currentRecord.tmdbId,
    addedAt: currentRecord.addedAt
  });

  const nextRecords = [...records];
  nextRecords[index] = updatedRecord;
  await writeStoredMovies(nextRecords);

  return updatedRecord;
}
