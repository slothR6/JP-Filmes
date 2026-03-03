import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: {
    default: 'JP Filmes',
    template: '%s | JP Filmes'
  },
  description: 'Catalogo de filmes hidratado pelo TMDb com busca, filtros completos, admin simples e player HTML5.',
  metadataBase: new URL('https://jp-filmes.vercel.app'),
  openGraph: {
    title: 'JP Filmes',
    description: 'Cadastre filmes pelo TMDb e publique a ficha automaticamente.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JP Filmes',
    description: 'Catalogo automatico de filmes com TMDb, fallback robusto e player pronto para teste.'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="text-ink">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="orb orb-three" />
        </div>
        <Header />
        <main className="mx-auto min-h-[calc(100vh-88px)] max-w-7xl px-4 py-8 md:py-10">{children}</main>
      </body>
    </html>
  );
}
