import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/15 bg-panel/50 px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">404</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Esse filme saiu de cena.</h1>
      <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted">
        O item que você procurou não existe no dataset atual ou o link ficou desatualizado.
      </p>
      <Link
        href="/filmes"
        className="mt-6 inline-flex rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-semibold text-accent transition hover:bg-accent hover:text-surface"
      >
        Voltar ao catálogo
      </Link>
    </div>
  );
}
