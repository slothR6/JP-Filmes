import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4" aria-label="Navegacao principal">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-lg font-black text-surface">
            JP
          </span>
          <span className="text-lg font-semibold tracking-[0.12em] text-white">JP Filmes</span>
        </Link>

        <div className="flex items-center gap-3 text-sm text-white/80 md:gap-6">
          <Link href="/" className="transition hover:text-white">
            Inicio
          </Link>
          <Link href="/filmes" className="transition hover:text-white">
            Filmes
          </Link>
          <Link href="/admin/adicionar" className="transition hover:text-white">
            Admin
          </Link>
          <Link
            href="/admin/adicionar"
            className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 font-medium text-accent transition hover:bg-accent hover:text-surface"
          >
            Adicionar filme
          </Link>
        </div>
      </nav>
    </header>
  );
}
