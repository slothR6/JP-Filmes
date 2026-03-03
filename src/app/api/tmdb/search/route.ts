import { NextResponse } from 'next/server';
import { searchTmdbMovies } from '@/lib/tmdb';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';
  const yearValue = searchParams.get('year');
  const year = yearValue ? Number(yearValue) : null;

  if (!query) {
    return NextResponse.json({ ok: false, results: [], error: 'Parameter q is required.' }, { status: 400 });
  }

  const { results, error } = await searchTmdbMovies(query, Number.isFinite(year) ? year : null);

  return NextResponse.json({
    ok: !error,
    results,
    error
  });
}
