import { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { allMovies, getMovieBySlug } from '@/lib/movies';
import { AdSlot } from '@/components/AdSlot';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false });

export async function generateStaticParams() {
  return allMovies.map((movie) => ({ slug: movie.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const movie = getMovieBySlug(params.slug);
  if (!movie) return {};
  return {
    title: `${movie.title} (${movie.year}) | JP Filmes`,
    description: movie.description,
    openGraph: {
      title: movie.title,
      description: movie.description,
      images: [movie.posterUrl]
    },
    twitter: {
      card: 'summary_large_image',
      title: movie.title,
      description: movie.description,
      images: [movie.posterUrl]
    }
  };
}

export default function MoviePage({ params }: { params: { slug: string } }) {
  const movie = getMovieBySlug(params.slug);
  if (!movie) notFound();

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{movie.title}</h1>
        <p className="text-white/70">{movie.genre} • {movie.year}</p>
      </header>
      <VideoPlayer src={movie.streamUrl} title={movie.title} />
      <p className="text-white/85">{movie.description}</p>
      <p className="text-sm text-white/60">Source attribution: {movie.sourceAttribution}</p>
      <div className="flex flex-wrap gap-3">
        <Link href={`/watch/${movie.slug}`} className="rounded bg-accent px-4 py-2 font-medium text-black">Start Watch Party</Link>
        <a href="https://archive.org" className="rounded border border-white/20 px-4 py-2" target="_blank" rel="noreferrer">View Archive.org</a>
      </div>
      <AdSlot label="Mid-roll Ad Placeholder" />
    </article>
  );
}
