"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { photo, type PhotoKey } from "@/data/photos";
import { Credit, Photo } from "@/components/ui/photo";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { ChapterMark } from "./chapter-mark";
import { cn } from "@/lib/utils";

const SPECIMENS: { id: PhotoKey; no: string; name: string; latin: string; scale: string; fact: string; slug?: string }[] = [
  { id: "atta-1", no: "A-01", name: "Муравей-листорез", latin: "Atta cephalotes", scale: "≈ 1 см", fact: "Листья не едят: на них в гнезде выращивают гриб. Самые мелкие рабочие едут на листе и отгоняют паразитических мух.", slug: "leafcutter-ant" },
  { id: "morpho-1", no: "L-02", name: "Морфо Хелена", latin: "Morpho helenor", scale: "≈ 12 см", fact: "Синий цвет создают не пигменты, а наноструктуры чешуек, отражающие свет.", slug: "morpho" },
  { id: "fulgora-1", no: "H-03", name: "Фонарница", latin: "Fulgora laternaria", scale: "≈ 8 см", fact: "Вздутый вырост головы похож на голову ящерицы; при опасности насекомое раскрывает крылья с глазчатыми пятнами.", },
  { id: "theraphosa-1", no: "R-04", name: "Терафоза Блонда", latin: "Theraphosa blondi", scale: "до 30 см", fact: "Самый массивный паук мира; защищается жгучими волосками и шипением.", slug: "goliath-birdeater" },
  { id: "ameerega-1", no: "F-05", name: "Трёхполосый древолаз", latin: "Ameerega trivittata", scale: "≈ 4 см", fact: "Как и другие древолазы, получает алкалоиды из пищи — мелких муравьёв.", },
];

/** Magnifying lens: a second copy of the image shown 2.6× inside a circle. */
function Loupe({ id, alt }: { id: PhotoKey; alt: string }) {
  const p = photo(id);
  const [pos, setPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const Z = 2.6;
  const R = 110;
  const move = (cx: number, cy: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos({ x: cx - r.left, y: cy - r.top, w: r.width, h: r.height });
  };
  return (
    <div
      ref={box}
      className="relative aspect-[3/2] w-full cursor-none overflow-hidden"
      onPointerMove={(e) => move(e.clientX, e.clientY)}
      onPointerDown={(e) => move(e.clientX, e.clientY)}
      onPointerLeave={() => setPos(null)}
      role="img"
      aria-label={`${alt}. Наведите курсор или коснитесь, чтобы рассмотреть детали под лупой.`}
    >
      <Image src={p.src} alt="" fill sizes="(min-width:768px) 60vw, 100vw" placeholder="blur" blurDataURL={p.blur} className="object-cover" quality={85} />
      {pos && (
        <div
          className="pointer-events-none absolute rounded-full border border-[var(--milk-60)] shadow-[0_20px_60px_rgb(0_0_0/0.6)]"
          style={{
            width: R * 2,
            height: R * 2,
            left: pos.x - R,
            top: pos.y - R,
            backgroundImage: `url(${p.src})`,
            backgroundSize: `${pos.w * Z}px ${pos.h * Z}px`,
            backgroundPosition: `${-pos.x * Z + R}px ${-pos.y * Z + R}px`,
          }}
        >
          <span className="t-mono absolute -bottom-6 left-1/2 -translate-x-1/2 text-[var(--milk-80)]">×{Z}</span>
        </div>
      )}
      {!pos && (
        <span className="t-label pointer-events-none absolute left-5 top-5 bg-[rgb(5_12_8/0.6)] px-3 py-2 text-milk">Лупа · наведите курсор</span>
      )}
    </div>
  );
}

export function SmallWorlds() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="small-worlds" className="relative bg-[#0d1a10] py-[var(--section-y)]" aria-labelledby="small-title">
      <div className="gutter grid gap-12 md:grid-cols-12">
        <div className="md:col-span-12">
          <ChapterMark no="05" en="Small Worlds" ru="Малые миры" />
        </div>
        <div className="md:col-span-7">
          <Loupe id="dendro-1" alt="Красильный древолаз с жёлто-чёрным узором на спине и синими лапами, Французская Гвиана" />
          <div className="mt-3 flex justify-between gap-4">
            <span className="t-mono text-[var(--milk-40)]">Dendrobates tinctorius · Гвианский щит</span>
            <Credit id="dendro-1" />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-10 md:col-span-4 md:col-start-9">
          <div>
            <SplitHeading id="small-title" className="t-display" mode="chars">
              Small Worlds
            </SplitHeading>
            <Reveal>
              <p className="t-body mt-8">
                Большая часть видов Амазонии — насекомые, пауки и другие беспозвоночные, многие из которых ещё не описаны.
                На одном дереве в кроне энтомологи находят сотни видов жуков и муравьёв.
              </p>
            </Reveal>
          </div>
          <Reveal className="border-l border-gold-400 pl-6">
            <p className="t-mono text-gold-300">Красильный древолаз</p>
            <p className="t-small mt-2">
              Яркий узор предупреждает хищников о ядовитости. Токсины лягушка получает с пищей — мелкими муравьями и
              клещами. Вид живёт только на Гвианском щите, а не по всей Амазонии.
            </p>
            <Link href="/animals/poison-frog" className="t-label link-u mt-4 inline-block text-gold-300">
              Досье →
            </Link>
          </Reveal>
        </div>
      </div>

      {/* specimen drawer: images unfold on demand */}
      <div className="gutter mt-[var(--section-y)]">
        <p className="t-label text-[var(--milk-40)]">Коллекция экспедиции · 5 образцов</p>
        <ul className="mt-6 border-t border-[var(--milk-15)]">
          {SPECIMENS.map((s, i) => {
            const isOpen = open === i;
            return (
              <li key={s.id} className="border-b border-[var(--milk-15)]">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`spec-${s.id}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group grid w-full grid-cols-[4rem_1fr_auto] items-baseline gap-4 py-6 text-left md:grid-cols-[6rem_1fr_14rem_6rem]"
                >
                  <span className="t-mono text-gold-300">{s.no}</span>
                  <span className={cn("t-h2 transition-transform duration-700 ease-[var(--ease-out)]", isOpen ? "translate-x-3" : "group-hover:translate-x-2")}>{s.name}</span>
                  <span className="t-latin hidden text-[var(--milk-60)] md:block">{s.latin}</span>
                  <span className="t-mono text-right text-[var(--milk-40)]">{s.scale}</span>
                </button>
                <div
                  id={`spec-${s.id}`}
                  className={cn("grid transition-[grid-template-rows] duration-700 ease-[var(--ease-out)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-8 pb-10 md:grid-cols-12">
                      <Photo
                        id={s.id}
                        alt={`${s.name} (${s.latin})`}
                        className={cn("aspect-[16/10] md:col-span-7 md:col-start-2 transition-[clip-path] duration-1000", isOpen ? "[clip-path:inset(0)]" : "[clip-path:inset(0_0_100%_0)]")}
                        sizes="(min-width:768px) 55vw, 100vw"
                      />
                      <div className="md:col-span-3 md:col-start-10">
                        <p className="t-body">{s.fact}</p>
                        <div className="mt-6 flex items-center gap-3" aria-hidden>
                          <span className="h-px w-12 bg-milk" />
                          <span className="t-mono text-[var(--milk-60)]">{s.scale}</span>
                        </div>
                        {s.slug && (
                          <Link href={`/animals/${s.slug}`} className="t-label link-u mt-6 inline-block text-gold-300">
                            Досье →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
