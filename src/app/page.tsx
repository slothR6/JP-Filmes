import Link from 'next/link';
import { MovieCard } from '@/components/MovieCard';
import { getAllMovies } from '@/lib/movies';
import { getFeaturedMovies, getRecentMovies, getRecommendedMovies } from '@/lib/movie-utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const movies = await getAllMovies();
  const highlights = getFeaturedMovies(movies).slice(0, 8);
  const newest = getRecentMovies(movies).slice(0, 4);
  const recommended = getRecommendedMovies(movies).slice(0, 4);

  return (
    <div className="space-y-12 pb-10 md:space-y-16">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-panel/80 px-6 py-8 shadow-glow md:px-10 md:py-12">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(245,183,0,0.18),transparent_58%)] md:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">JP Filmes + TMDb</p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold text-white md:text-6xl">
                Cadastro automatico de filmes com player pronto para teste.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted md:text-lg">
                O catalogo agora vive de `tmdbId`: poster, sinopse, ano, duracao, idiomas e direcao chegam no server sem
                preencher `movies.ts` na mao.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/filmes"
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-surface transition hover:translate-y-[-1px] hover:bg-white"
              >
                Ver filmes
              </Link>
              <Link
                href="/admin/adicionar"
                className="rounded-full border border-white/14 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Adicionar filme
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: 'Filmes no catalogo', value: String(movies.length).padStart(2, '0') },
              { label: 'Em destaque', value: String(highlights.length).padStart(2, '0') },
              { label: 'Com player pronto', value: String(movies.filter((movie) => movie.playback?.src).length).padStart(2, '0') }
            ].map((stat) => (
              <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Destaques</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Titulos hidratados automaticamente.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            Basta salvar `tmdbId`, `featured`, `tags` e preferencias internas no JSON local.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} priority={index < 4} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5 rounded-[2rem] border border-white/10 bg-panel/70 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Novos</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Recem-adicionados</h2>
            </div>
            <Link href="/filmes" className="text-sm font-semibold text-white/80 transition hover:text-white">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {newest.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>

        <div className="space-y-5 rounded-[2rem] border border-white/10 bg-panel/70 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Recomendados</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Popularidade e nota do TMDb</h2>
            </div>
            <Link href="/filmes" className="text-sm font-semibold text-white/80 transition hover:text-white">
              Explorar
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {recommended.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
