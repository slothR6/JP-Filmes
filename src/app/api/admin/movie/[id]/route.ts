import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { updateStoredMovie } from '@/lib/movie-store';
import type { MovieAudioPreference, PlaybackSource, StoredMovieRecord } from '@/lib/types';
import { hydrateMovieRecord } from '@/lib/tmdb';

export const runtime = 'nodejs';

type RouteProps = {
  params: Promise<{ id: string }>;
};

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((tag) => String(tag ?? '').trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeAudioPreference(value: unknown): MovieAudioPreference | undefined {
  return value === 'dubbed' || value === 'subtitled' || value === 'both' ? value : undefined;
}

function normalizePlayback(value: unknown): PlaybackSource | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as Partial<PlaybackSource>;
  if (!candidate.src || typeof candidate.src !== 'string' || !candidate.src.trim()) {
    return undefined;
  }

  return {
    type: candidate.type === 'local' ? 'local' : 'url',
    src: candidate.src.trim()
  };
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as Partial<StoredMovieRecord> | null;

  if (!payload) {
    return NextResponse.json({ ok: false, error: 'Invalid payload.' }, { status: 400 });
  }

  const updates: Partial<StoredMovieRecord> = {
    featured: Boolean(payload.featured),
    audioPreference: normalizeAudioPreference(payload.audioPreference),
    languagePreference:
      typeof payload.languagePreference === 'string' && payload.languagePreference.trim()
        ? payload.languagePreference.trim()
        : undefined,
    tags: normalizeTags(payload.tags),
    playback: normalizePlayback(payload.playback)
  };

  const updatedRecord = await updateStoredMovie(id, updates);

  if (!updatedRecord) {
    return NextResponse.json({ ok: false, error: 'Movie not found.' }, { status: 404 });
  }

  const movie = await hydrateMovieRecord(updatedRecord);

  revalidatePath('/');
  revalidatePath('/filmes');
  revalidatePath('/admin/adicionar');
  revalidatePath(`/filmes/${movie.id}`);

  return NextResponse.json({
    ok: true,
    record: updatedRecord,
    movie
  });
}
