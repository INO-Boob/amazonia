import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { ACTIVITY_LABEL, animals, getAnimal, GROUP_LABEL, HABITAT_LABEL, IUCN_LABEL } from "@/data/animals";
import { zones } from "@/data/zones";
import { photo } from "@/data/photos";
import { Photo } from "@/components/ui/photo";
import { IucnBadge, IucnScale } from "@/components/animal/iucn-badge";
import { Reveal } from "@/components/motion/reveal";

export function generateStaticParams() {
  return animals.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/animals/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getAnimal(slug);
  if (!a) return {};
  return {
    title: `${a.nameRu} — ${a.scientific}`,
    description: a.tagline,
    openGraph: { images: [photo(a.photo).src] },
  };
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export default async function AnimalPage({ params }: PageProps<"/animals/[slug]">) {
  const { slug } = await params;
  const a = getAnimal(slug);
  if (!a) notFound();
  const i = animals.indexOf(a);
  const prev = animals[(i - 1 + animals.length) % animals.length];
  const next = animals[(i + 1) % animals.length];
  const p = photo(a.photo);
  const animalZones = zones.filter((z) => a.zones.includes(z.id));

  const sheet: [string, string][] = [
    ["Группа", GROUP_LABEL[a.group]],
    ["Образ жизни", ACTIVITY_LABEL[a.activity]],
    ["Ярусы и среды", a.habitats.map((h) => HABITAT_LABEL[h]).join(", ")],
    ...a.size.map((s) => [s.label, s.value] as [string, string]),
  ];

  return (
    <article className="bg-forest-950">
      {/* split screen: sticky photograph + dossier */}
      <div className="lg:grid lg:grid-cols-2">
        <div className="relative h-[72svh] lg:sticky lg:top-0 lg:h-[100svh]">
          <Photo id={a.photo} alt={`${a.nameRu} (${a.scientific})`} className="h-full w-full" sizes="(min-width:1024px) 50vw, 100vw" priority quality={85} credit={false} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(7_18_12/0.55)_0%,transparent_30%,transparent_70%,rgb(7_18_12/0.8)_100%)]" />
          <div className="absolute bottom-5 left-[var(--gutter)] right-[var(--gutter)] flex flex-wrap items-end justify-between gap-3">
            <p className="t-mono text-[var(--milk-60)]">
              {Math.abs(p.lat)}°{p.lat < 0 ? "S" : "N"} {Math.abs(p.lon)}°W · {p.observedOn}
            </p>
            <a href={p.observationUrl} target="_blank" rel="noopener noreferrer" className="t-mono text-[0.62rem] text-[var(--milk-60)] hover:text-milk">
              © {p.author} · {p.license} · iNaturalist
            </a>
          </div>
        </div>

        <div className="gutter pb-24 pt-12 lg:pt-[calc(var(--header-h)+5rem)]">
          <Link href="/animals" className="t-label link-u inline-flex items-center gap-2 text-[var(--milk-60)]">
            <ArrowLeft size={14} /> Все животные
          </Link>
          <p className="t-mono mt-10 text-gold-300">№ {a.index} / {String(animals.length).padStart(2, "0")}</p>
          <h1 className="t-display mt-4">{a.nameRu}</h1>
          <p className="t-latin mt-3 text-2xl text-[var(--milk-60)]">
            {a.scientific} <span className="font-sans text-sm not-italic text-[var(--milk-40)]">· {a.nameEn}</span>
          </p>
          <p className="t-lead mt-8 max-w-xl text-[var(--milk-80)]">{a.tagline}</p>

          <div className="mt-12 space-y-5">
            {a.description.map((d) => (
              <p key={d.slice(0, 20)} className="t-body measure-wide">
                {d}
              </p>
            ))}
          </div>

          {/* scientific metadata */}
          <dl className="mt-14 border-t border-[var(--milk-15)]">
            {sheet.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-[var(--milk-08)] py-4 sm:grid-cols-[12rem_1fr]">
                <dt className="t-mono text-[var(--milk-40)]">{k}</dt>
                <dd className="t-small text-milk">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            <section>
              <h2 className="t-label text-gold-300">Ареал</h2>
              <p className="t-body mt-3">{a.range}</p>
            </section>
            <section>
              <h2 className="t-label text-gold-300">Среда обитания</h2>
              <p className="t-body mt-3">{a.habitat}</p>
            </section>
            <section>
              <h2 className="t-label text-gold-300">Рацион</h2>
              <p className="t-body mt-3">{a.diet}</p>
            </section>
            <section>
              <h2 className="t-label text-gold-300">Роль в экосистеме</h2>
              <p className="t-body mt-3">{a.role}</p>
            </section>
          </div>

          <section className="mt-14">
            <h2 className="t-label text-gold-300">Поведение</h2>
            <ul className="mt-4">
              {a.behavior.map((b, k) => (
                <li key={b} className="grid grid-cols-[2.5rem_1fr] border-b border-[var(--milk-08)] py-3">
                  <span className="t-mono text-[var(--milk-40)]">{String(k + 1).padStart(2, "0")}</span>
                  <span className="t-body">{b}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14 border border-[var(--milk-15)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="t-label text-gold-300">Природоохранный статус</h2>
              <IucnBadge code={a.status.code} />
            </div>
            <div className="mt-6">
              <IucnScale code={a.status.code} />
            </div>
            <p className="t-small mt-6">
              {IUCN_LABEL[a.status.code]}
              {a.status.assessed && `, оценка ${a.status.assessed} г.`} {a.status.note}
            </p>
            <p className="t-mono mt-4 text-[var(--milk-40)]">
              Источник:{" "}
              <a className="link-u text-[var(--milk-60)]" href={a.status.sourceUrl} target="_blank" rel="noopener noreferrer">
                {a.status.source}
              </a>{" "}
              · сверено {fmtDate(a.status.checked)}
            </p>
          </section>

          {animalZones.length > 0 && (
            <section className="mt-14">
              <h2 className="t-label text-gold-300">Где искать на карте</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {animalZones.map((z) => (
                  <li key={z.id}>
                    <Link href={`/map?zone=${z.id}`} className="t-small inline-flex items-center gap-2 border border-[var(--milk-15)] px-3 py-1.5 hover:border-gold-300">
                      <MapPin size={13} strokeWidth={1.5} /> {z.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="t-mono mt-3 text-[var(--milk-40)]">Зоны показывают типичные местообитания, а не точные границы ареала.</p>
            </section>
          )}

          {a.gallery && a.gallery.length > 0 && (
            <section className="mt-16">
              <h2 className="t-label text-gold-300">Полевые фотографии</h2>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {a.gallery.map((g, k) => (
                  <Reveal key={g} delay={k * 0.08} className={k === 0 && a.gallery!.length % 2 ? "col-span-2" : ""}>
                    <Photo id={g} alt={`${a.nameRu}: наблюдение натуралиста`} className={k === 0 && a.gallery!.length % 2 ? "aspect-[16/9]" : "aspect-square"} sizes="(min-width:1024px) 25vw, 50vw" />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <nav aria-label="Соседние виды" className="gutter grid grid-cols-2 border-t border-[var(--milk-15)]">
        <Link href={`/animals/${prev.slug}`} className="group flex flex-col gap-2 py-10 pr-4">
          <span className="t-mono inline-flex items-center gap-2 text-[var(--milk-40)]">
            <ArrowLeft size={14} /> Предыдущий
          </span>
          <span className="t-h2 transition-colors group-hover:text-gold-300">{prev.nameRu}</span>
        </Link>
        <Link href={`/animals/${next.slug}`} className="group flex flex-col items-end gap-2 border-l border-[var(--milk-15)] py-10 pl-4 text-right">
          <span className="t-mono inline-flex items-center gap-2 text-[var(--milk-40)]">
            Следующий <ArrowRight size={14} />
          </span>
          <span className="t-h2 transition-colors group-hover:text-gold-300">{next.nameRu}</span>
        </Link>
      </nav>
    </article>
  );
}
