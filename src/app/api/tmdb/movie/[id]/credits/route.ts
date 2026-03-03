import { NextResponse } from 'next/server';
import { getTmdbMovieCredits } from '@/lib/tmdb';

export const runtime = 'nodejs';

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const movieId = Number(id);

  if (!Number.isFinite(movieId) || movieId <= 0) {
    return NextResponse.json({ ok: false, credits: null, error: 'Invalid movie id.' }, { status: 400 });
  }

  const { data, error } = await getTmdbMovieCredits(movieId);

  return NextResponse.json({
    ok: !error,
    credits: data,
    error
  });
}
