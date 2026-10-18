import type { Metadata } from "next";
import Image from "next/image";
import { organizations, sources } from "@/data/sources";
import { assets, ESC50_URL } from "@/data/assets";
import { photos } from "@/data/photos";
import { animals, IUCN_LABEL } from "@/data/animals";

export const metadata: Metadata = {
  title: "Источники и авторы",
  description: "Научные источники, авторы фотографий, звуков и 3D-ресурсов проекта AMAZONIA, лицензии и даты проверки данных.",
};

export default function SourcesPage() {
  const list = Object.entries(photos).sort(([a], [b]) => a.localeCompare(b));
  return (
    <div className="bg-forest-950 pb-[var(--section-y)] pt-[calc(var(--header-h)+6vh)]">
      <header className="gutter grid gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="t-mono text-gold-300">IV — Sources</p>
          <h1 className="t-display mt-6">Источники, авторы, лицензии</h1>
        </div>
        <p className="t-body self-end md:col-span-4 md:col-start-9">
          Факты на сайте сверены с научными публикациями и данными профильных организаций. Изменяющиеся данные —
          природоохранные статусы и темпы обезлесения — сопровождаются датой. Все внешние ресурсы хранятся локально.
        </p>
      </header>

      <section className="gutter mt-24" aria-labelledby="bib">
        <h2 id="bib" className="t-label text-[var(--milk-40)]">Библиография</h2>
        <ol className="mt-6 border-t border-[var(--milk-15)]">
          {sources.map((s, i) => (
            <li key={s.id} className="grid gap-3 border-b border-[var(--milk-08)] py-6 md:grid-cols-[4rem_1fr_1fr]">
              <span className="t-mono text-gold-300">[{String(i + 1).padStart(2, "0")}]</span>
              <div>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-u text-milk">
                  {s.title}
                </a>
                <p className="t-small mt-1">
                  {s.publisher}, {s.year}
                </p>
              </div>
              <p className="t-small">{s.usedFor}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="gutter mt-24" aria-labelledby="status">
        <h2 id="status" className="t-label text-[var(--milk-40)]">Природоохранные статусы (IUCN), сверено 18.10.2026</h2>
        <p className="t-small mt-3 max-w-3xl">
          Категории сверены по данным IUCN Red List и BirdLife International через опубликованные оценки. Красная книга
          регулярно обновляется — перед цитированием проверьте актуальную оценку по ссылке.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[var(--milk-15)]">
                {["Вид", "Категория", "Оценка", "Примечание"].map((h) => (
                  <th key={h} scope="col" className="t-mono py-3 pr-6 font-normal text-[var(--milk-40)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {animals.map((a) => (
                <tr key={a.slug} className="border-b border-[var(--milk-08)] align-top">
                  <th scope="row" className="py-3 pr-6 font-normal">
                    <span className="text-milk">{a.nameRu}</span>
                    <span className="t-latin block text-sm text-[var(--milk-60)]">{a.scientific}</span>
                  </th>
                  <td className="t-small py-3 pr-6">
                    <a href={a.status.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-u text-milk">
                      {a.status.code}
                    </a>{" "}
                    — {IUCN_LABEL[a.status.code]}
                  </td>
                  <td className="t-mono py-3 pr-6 text-[var(--milk-60)]">{a.status.assessed ?? "—"}</td>
                  <td className="t-small py-3">{a.status.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gutter mt-24" aria-labelledby="photos">
        <h2 id="photos" className="t-label text-[var(--milk-40)]">Фотографии · {list.length}</h2>
        <p className="t-small mt-3 max-w-3xl">
          Все фотографии — наблюдения натуралистов на iNaturalist, загруженные из открытого набора iNaturalist Open Data
          (только лицензии CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA; без запрета производных работ). Для каждого кадра
          проверено, что координаты наблюдения лежат в Амазонии или на Гвианском щите. Изображения хранятся локально и
          сжимаются при выдаче (AVIF/WebP).
        </p>
        <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(([key, p]) => (
            <li key={key} className="flex gap-4 border-b border-[var(--milk-08)] pb-4">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden">
                <Image src={p.src} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <p className="t-latin truncate text-milk">{p.taxon}</p>
                <p className="t-small truncate">
                  ©{" "}
                  <a href={p.observationUrl} target="_blank" rel="noopener noreferrer" className="link-u">
                    {p.author}
                  </a>{" "}
                  ·{" "}
                  <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer" className="link-u">
                    {p.license}
                  </a>
                </p>
                <p className="t-mono truncate text-[var(--milk-40)]">
                  {p.observedOn} · {p.lat}°, {p.lon}°
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="gutter mt-24" aria-labelledby="media">
        <h2 id="media" className="t-label text-[var(--milk-40)]">Звук, 3D, текстуры, геоданные</h2>
        <p className="t-small mt-3 max-w-3xl">
          Звуки — полевые записи с Freesound в виде 5-секундных клипов из открытого набора{" "}
          <a href={ESC50_URL} className="link-u text-milk" target="_blank" rel="noopener noreferrer">
            ESC-50
          </a>
          . Подходящие записи именно из Амазонии в доступных открытых источниках найти не удалось, поэтому использованы
          записи тропического леса Дейнтри (Австралия), древесных лягушек, насекомых и дождя. Клипы смешиваются в
          реальном времени и не повторяются дословно. 3D-лес полностью процедурный: геометрия и текстуры листьев
          генерируются в браузере.
        </p>
        <ul className="mt-8 border-t border-[var(--milk-15)]">
          {assets.map((a) => (
            <li key={a.file} className="grid gap-2 border-b border-[var(--milk-08)] py-4 md:grid-cols-[6rem_1.2fr_1fr_1.4fr]">
              <span className="t-mono text-gold-300">{a.kind}</span>
              <a href={a.source} target="_blank" rel="noopener noreferrer" className="link-u text-milk">
                {a.title}
              </a>
              <span className="t-small">
                {a.author} · {a.licenseUrl ? <a className="link-u" href={a.licenseUrl} target="_blank" rel="noopener noreferrer">{a.license}</a> : a.license}
              </span>
              <span className="t-small">{a.purpose}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="gutter mt-24" aria-labelledby="orgs">
        <h2 id="orgs" className="t-label text-[var(--milk-40)]">Природоохранные и научные организации</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((o) => (
            <li key={o.name}>
              <a href={o.url} target="_blank" rel="noopener noreferrer" className="link-u text-milk">
                {o.name}
              </a>
              <p className="t-small mt-1">{o.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
