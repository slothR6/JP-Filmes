import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'JP Filmes | Public Domain Streaming',
  description: 'Modern streaming platform for legal public domain films sourced from Internet Archive.',
  metadataBase: new URL('https://jp-filmes.vercel.app'),
  openGraph: {
    title: 'JP Filmes',
    description: 'Watch classic public domain films legally from Internet Archive sources.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JP Filmes',
    description: 'Public domain streaming done right.'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
