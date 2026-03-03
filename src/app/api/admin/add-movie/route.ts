import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { addStoredMovie } from '@/lib/movie-store';
import { hydrateMovieRecord } from '@/lib/tmdb';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { tmdbId?: number } | null;
  const tmdbId = Number(payload?.tmdbId);

  if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ ok: false, error: 'tmdbId is required.' }, { status: 400 });
  }

  const result = await addStoredMovie(tmdbId);
  const movie = await hydrateMovieRecord(result.record);

  revalidatePath('/');
  revalidatePath('/filmes');
  revalidatePath('/admin/adicionar');
  revalidatePath(`/filmes/${movie.id}`);

  return NextResponse.json({
    ok: true,
    added: result.added,
    record: result.record,
    movie
  });
}
