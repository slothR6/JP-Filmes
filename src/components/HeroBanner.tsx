import Link from 'next/link';
import { Movie } from '@/lib/types';

export function HeroBanner({ movie }: { movie: Movie }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-card p-8 md:p-12">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" aria-hidden />
      <div className="relative max-w-xl space-y-4">
        <p className="text-sm uppercase tracking-widest text-accent">Featured Public Domain</p>
        <h1 className="text-4xl font-bold md:text-5xl">{movie.title}</h1>
        <p className="text-white/80">{movie.description}</p>
        <div className="flex gap-3">
          <Link href={`/movie/${movie.slug}`} className="rounded bg-accent px-5 py-3 font-medium text-black hover:opacity-90">
            Watch now
          </Link>
          <Link href="/legal" className="rounded border border-white/20 px-5 py-3 hover:border-white/50">
            Compliance
          </Link>
        </div>
      </div>
    </section>
  );
}
