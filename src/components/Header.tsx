import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4" aria-label="Main navigation">
        <Link href="/" className="text-2xl font-bold tracking-tight text-accent">
          JP Filmes
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <Link href="/legal" className="hover:text-accent transition-colors">Legal</Link>
        </div>
      </nav>
    </header>
  );
}
