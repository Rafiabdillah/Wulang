import type { ReactNode } from 'react';

// Teks biasa dengan potongan `kode` di antara tanda kutip balik.
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  const nodes: ReactNode[] = parts.map((p, i) =>
    p.startsWith('`') && p.endsWith('`') && p.length > 2 ? (
      <code key={i}>{p.slice(1, -1)}</code>
    ) : (
      <span key={i}>{p}</span>
    )
  );
  return <>{nodes}</>;
}
