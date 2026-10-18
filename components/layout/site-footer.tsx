import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="gutter relative border-t border-[var(--milk-08)] bg-night pb-10 pt-16">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-3xl tracking-[0.3em]">AMAZONIA</p>
          <p className="t-small mt-4 max-w-sm">
            Некоммерческий образовательный проект об удивительном животном мире Амазонии. Все фотографии — реальные
            наблюдения натуралистов на iNaturalist под лицензиями Creative Commons.
          </p>
        </div>
        <nav aria-label="Ссылки в подвале" className="md:col-span-3">
          <p className="t-label text-[var(--milk-40)]">Разделы</p>
          <ul className="mt-4 space-y-2">
            <li><Link className="link-u" href="/">Экспедиция</Link></li>
            <li><Link className="link-u" href="/animals">Каталог животных</Link></li>
            <li><Link className="link-u" href="/map">Интерактивная карта</Link></li>
            <li><Link className="link-u" href="/sources">Источники и авторы</Link></li>
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="t-label text-[var(--milk-40)]">Данные</p>
          <p className="t-small mt-4">
            Фото: iNaturalist Open Data. Карта: Natural Earth. Звук: полевые записи Freesound из набора ESC-50.
            Статусы: IUCN Red List, сверено 18.10.2026.
          </p>
        </div>
      </div>
      <div className="hairline mt-14" />
      <div className="t-mono mt-6 flex flex-wrap justify-between gap-4 text-[var(--milk-40)]">
        <span>THE LIVING RAINFOREST · {new Date().getFullYear()}</span>
        <span>0°00′ — 20°S · 44°W — 80°W</span>
      </div>
    </footer>
  );
}
