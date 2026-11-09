import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Footer, Header } from '../components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Wulang: latihan spreadsheet lewat soal cerita', template: '%s | Wulang' },
  description:
    'Berlatih rumus Excel dan Google Sheets lewat soal cerita. Tiap sel dicek langsung, ada XP, kursus, dan ensiklopedia fungsi. Gratis dan jalan di browser.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f1e3' },
    { media: '(prefers-color-scheme: dark)', color: '#14162b' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Header />
        <main id="main" className="wrap">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
