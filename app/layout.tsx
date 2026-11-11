import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  metadataBase: new URL('https://wulang.vercel.app'),
  title: 'Wulang - Platform Latihan Spreadsheet Bisnis',
  description: 'Kuasai rumus Excel dan Google Sheets interaktif berbasis kasus kerja nyata.',
  openGraph: {
    title: 'Wulang - Spreadsheet Lab',
    description: 'Platform latihan spreadsheet interaktif dengan 5 Pilar Modul Bisnis.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 antialiased min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
