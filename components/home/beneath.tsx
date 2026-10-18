"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useQualityTier, useSettings } from "@/lib/settings";
import { LazyRiver } from "@/components/three/lazy";
import { Credit, Photo } from "@/components/ui/photo";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { useSoundZone } from "@/components/layout/sound-engine";
import { ChapterMark } from "./chapter-mark";
import type { PhotoKey } from "@/data/photos";

const SPECIES: { id: PhotoKey; slug?: string; name: string; latin: string; depth: string; text: string }[] = [
  { id: "boto-1", slug: "boto", name: "Бото", latin: "Inia geoffrensis", depth: "0–8 м", text: "Розовый речной дельфин. В половодье охотится между стволами затопленного леса; гибкая шея позволяет поворачивать голову почти под прямым углом." },
  { id: "arapaima-1", slug: "arapaima", name: "Арапаима", latin: "Arapaima gigas", depth: "у поверхности", text: "Дышит воздухом и всплывает каждые 5–15 минут. Восстановилась там, где рыбаки сами охраняют озёра." },
  { id: "piranha-1", slug: "piranha", name: "Краснобрюхая пиранья", latin: "Pygocentrus nattereri", depth: "пойменные озёра", text: "Стаи — прежде всего защита от хищников. Всеядна и питается в том числе падалью." },
  { id: "eel-1", slug: "electric-eel", name: "Электрический угорь", latin: "Electrophorus varii", depth: "мутные заводи", text: "Не угорь, а гимнотообразная рыба. Поднимается к поверхности за глотком воздуха; родственный вид E. voltai выдаёт до 860 В." },
  { id: "otter-1", slug: "giant-otter", name: "Гигантская выдра", latin: "Pteronura brasiliensis", depth: "старицы и протоки", text: "Семейные группы охотятся вместе. Вид под угрозой исчезновения." },
  { id: "caiman-1", slug: "black-caiman", name: "Чёрный кайман", latin: "Melanosuchus niger", depth: "у поверхности", text: "Крупнейший хищник Амазонии, переживший массовый промысел ради шкур." },
  { id: "tucuxi-1", name: "Тукуши", latin: "Sotalia fluviatilis", depth: "русла рек", text: "Небольшой серый речной дельфин; держится в открытой воде и редко заходит в затопленный лес." },
];

export function Beneath() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [depth, setDepth] = useState(0);
  const tier = useQualityTier();
  const motion = useSettings((s) => s.motion);
  useSoundZone(root, "water");

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progress.current = self.progress;
          setDepth(Math.round(self.progress * 12));
        },
      });
      if (!motion) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(
        q(".surface-photo"),
        { scale: 1.05, filter: "brightness(1)" },
        { scale: 1.25, filter: "brightness(0.4) hue-rotate(-10deg)", ease: "none", scrollTrigger: { trigger: q(".surface")[0], start: "top top", end: "bottom top", scrub: true } },
      );
      gsap.fromTo(
        q(".waterline"),
        { yPercent: 100 },
        { yPercent: 0, ease: "none", scrollTrigger: { trigger: q(".surface")[0], start: "top top", end: "bottom top", scrub: true } },
      );
    },
    { scope: root, dependencies: [motion] },
  );

  const scrollRail = (dir: number) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section ref={root} id="river" className="relative bg-river-900" aria-labelledby="river-title">
      {/* 1 — the surface: lilies, then the water line rises over the frame */}
      <div className="surface relative h-[120svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="surface-photo absolute inset-0">
            <Photo id="victoria-1" alt="Озеро с гигантскими листьями виктории амазонской у края затопленного леса, Манаус" className="h-full w-full" sizes="100vw" credit={false} />
          </div>
          <div className="waterline pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(8_25_27/0.2)_0%,rgb(8_25_27/0.9)_40%,var(--river-900)_75%)]" />
          <div className="gutter absolute inset-x-0 top-[calc(var(--header-h)+2rem)]">
            <ChapterMark no="04" en="Beneath the Surface" ru="Под поверхностью" tone="river" />
          </div>
          <div className="gutter absolute bottom-[12vh] left-0 max-w-4xl">
            <SplitHeading id="river-title" className="t-display" mode="words">
              Под поверхностью — другой лес
            </SplitHeading>
            <p className="t-body mt-6 max-w-xl">
              Каждый год реки Амазонии поднимаются на 10 и более метров. Вода на месяцы затапливает лес, и рыбы плавают
              среди крон, питаясь упавшими плодами. Все обитатели этой главы — пресноводные.
            </p>
          </div>
          <Credit id="victoria-1" className="absolute bottom-4 right-[var(--gutter)]" />
        </div>
      </div>

      {/* 2 — underwater stage */}
      <div className="relative">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {tier !== "poster" ? (
            <LazyRiver tier={tier} progress={progress} animate={motion} className="absolute inset-0" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,#3d6b5e_0%,#0f2b28_45%,#06110f_100%)]" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--river-900)_0%,transparent_20%,transparent_70%,rgb(6_17_15/0.9)_100%)]" />
          <div className="t-mono pointer-events-none absolute right-[var(--gutter)] top-[calc(var(--header-h)+2rem)] hidden flex-col items-end gap-2 text-river-300 md:flex">
            <span>глубина</span>
            <span className="font-display text-5xl font-light text-milk">−{depth} м</span>
            <span className="h-24 w-px bg-river-300/40" />
          </div>
        </div>

        <div className="relative -mt-[100svh] pb-[20vh]">
          <div className="gutter grid min-h-[80svh] items-center md:grid-cols-12">
            <Reveal className="md:col-span-5">
              <p className="t-lead text-river-300">Белые, чёрные и чистые воды</p>
              <p className="t-body mt-6">
                Учёные делят реки Амазонии по цвету воды. «Белые» — как Солимойнс и Мадейра — мутные от андийского ила и
                плодородные. «Чёрные» — как Риу-Негру — окрашены гуминовыми кислотами из бедных песчаных почв. «Чистые»
                — как Тапажос и Шингу — стекают с древних кристаллических щитов. У каждого типа свой набор видов.
              </p>
              <p className="t-mono mt-8 text-[var(--milk-40)]">2 406 видов рыб описано в бассейне · Jézéquel et al. 2020</p>
            </Reveal>
          </div>

          <div className="gutter flex items-end justify-between gap-6">
            <h3 className="t-h2 max-w-lg">Обитатели рек и затопленных лесов</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => scrollRail(-1)} className="grid h-12 w-12 place-items-center border border-[var(--milk-15)] hover:border-river-300" aria-label="Предыдущие виды">
                <ArrowLeft size={18} strokeWidth={1.4} />
              </button>
              <button type="button" onClick={() => scrollRail(1)} className="grid h-12 w-12 place-items-center border border-[var(--milk-15)] hover:border-river-300" aria-label="Следующие виды">
                <ArrowRight size={18} strokeWidth={1.4} />
              </button>
            </div>
          </div>

          <div
            ref={rail}
            className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[var(--gutter)] pb-6 [scrollbar-width:thin]"
            role="region"
            aria-label="Горизонтальная галерея речных видов"
            tabIndex={0}
          >
            {SPECIES.map((s, i) => (
              <article key={s.id} className={`group relative w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30vw] ${i % 2 ? "mt-16" : ""}`}>
                <Photo
                  id={s.id}
                  alt={`${s.name} (${s.latin})`}
                  className="aspect-[4/5] w-full"
                  sizes="(min-width:1024px) 30vw, 80vw"
                  imgClassName="transition-transform duration-[1.6s] ease-out group-hover:scale-105 [filter:saturate(0.85)]"
                />
                <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-river-300/30 pt-4">
                  <p className="t-h3">{s.name}</p>
                  <p className="t-mono text-river-300">{s.depth}</p>
                </div>
                <p className="t-latin mt-1 text-[var(--milk-60)]">{s.latin}</p>
                <p className="t-small mt-3">{s.text}</p>
                {s.slug && (
                  <Link href={`/animals/${s.slug}`} className="t-label link-u mt-4 inline-block text-river-300">
                    Досье →
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
