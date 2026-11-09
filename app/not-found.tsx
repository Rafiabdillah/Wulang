import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-head">
      <h1>Halaman tidak ketemu</h1>
      <p className="lead">Alamat yang kamu buka tidak ada, atau soalnya sudah dipindah.</p>
      <div className="cta">
        <Link href="/latihan" className="btn primary">
          Ke daftar latihan
        </Link>
        <Link href="/" className="btn ghost">
          Ke beranda
        </Link>
      </div>
    </section>
  );
}
