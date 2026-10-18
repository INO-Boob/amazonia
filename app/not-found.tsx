import Link from "next/link";

export default function NotFound() {
  return (
    <div className="gutter flex min-h-[100svh] flex-col justify-center bg-forest-950 pt-[var(--header-h)]">
      <p className="t-mono text-gold-300">404 — тропа заросла</p>
      <h1 className="t-display mt-6 max-w-3xl">Этой страницы нет на карте экспедиции</h1>
      <p className="t-body mt-6 max-w-lg">Возможно, ссылка устарела. Вернитесь к началу маршрута или откройте каталог животных.</p>
      <div className="mt-10 flex flex-wrap gap-6">
        <Link href="/" className="t-label link-u text-gold-300">На главную</Link>
        <Link href="/animals" className="t-label link-u text-gold-300">Каталог животных</Link>
      </div>
    </div>
  );
}
