import { NextResponse } from 'next/server';
import { getTmdbMovieDetails } from '@/lib/tmdb';

export const runtime = 'nodejs';

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const movieId = Number(id);

  if (!Number.isFinite(movieId) || movieId <= 0) {
    return NextResponse.json({ ok: false, movie: null, error: 'Invalid movie id.' }, { status: 400 });
  }

  const { data, error } = await getTmdbMovieDetails(movieId);

  return NextResponse.json({
    ok: Boolean(data),
    movie:
      data ?? {
        id: movieId,
        title: `Filme ${movieId}`,
        overview: 'Nao foi possivel carregar os dados do TMDb agora.',
        runtime: null,
        releaseDate: null,
        posterPath: null,
        backdropPath: null,
        genres: [],
        countries: [],
        languages: [],
        popularity: 0,
        voteAverage: null
      },
    error
  });
}
