"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSettings } from "@/lib/settings";
import { Photo, PhotoCaption } from "@/components/ui/photo";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { ChapterMark } from "./chapter-mark";
import type { PhotoKey } from "@/data/photos";

const LAYERS = [
  { h: "60 м", name: "Эмердженты" },
  { h: "40 м", name: "Полог" },
  { h: "20 м", name: "Подполог" },
  { h: "5 м", name: "Подлесок" },
];

const SMALL: { id: PhotoKey; alt: string; name: string; note: string; slug?: string; cls: string; sizes: string }[] = [
  { id: "toucan-1", alt: "Белогрудый тукан на ветке на фоне неба", name: "Белогрудый тукан", note: "Глотает плоды целиком и уносит семена далеко от дерева-родителя.", slug: "toucan", cls: "aspect-[4/3] md:col-span-7", sizes: "(min-width:768px) 35vw, 100vw" },
  { id: "spider-1", alt: "Перуанская коата среди крупных листьев", name: "Перуанская коата", note: "Хвост с голой «ладонью» на конце — пятая рука акробата.", slug: "spider-monkey", cls: "aspect-[3/4] md:col-span-5 md:mt-24", sizes: "(min-width:768px) 25vw, 100vw" },
  { id: "macao-1", alt: "Красный ара в полёте с раскрытыми крыльями", name: "Красный ара", note: "Пары держатся вместе годами и летят над пологом крыло к крылу.", slug: "scarlet-macaw", cls: "aspect-[16/10] md:col-span-8 md:col-start-3", sizes: "(min-width:768px) 40vw, 100vw" },
  { id: "sloth-1", alt: "Бурогорлый ленивец смотрит из кроны дерева", name: "Ленивец", note: "Медленный обмен веществ — ответ на бедную энергией листовую диету.", slug: "sloth", cls: "aspect-square md:col-span-5", sizes: "(min-width:768px) 25vw, 100vw" },
  { id: "howler-1", alt: "Красный ревун отдыхает, свесив лапы с ветки", name: "Красный ревун", note: "Его рёв слышен за километры: увеличенная подъязычная кость работает как резонатор.", cls: "aspect-[4/5] md:col-span-6 md:col-start-7 md:-mt-32", sizes: "(min-width:768px) 30vw, 100vw" },
  { id: "aracari-1", alt: "Каштаноухий арасари на ветке", name: "Каштаноухий арасари", note: "Мелкий родственник туканов, живёт шумными группами.", cls: "aspect-[5/4] md:col-span-5 md:col-start-2", sizes: "(min-width:768px) 25vw, 100vw" },
];

export function Canopy() {
  const root = useRef<HTMLElement>(null);
  const motion = useSettings((s) => s.motion);

  useGSAP(
    () => {
      if (!motion) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(
        q(".alt-fill"),
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 30%", end: "bottom 70%", scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>(q(".vline-grow")).forEach((el) =>
        gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%", once: true } }),
      );
    },
    { scope: root, dependencies: [motion] },
  );

  return (
    <section ref={root} id="canopy" className="relative overflow-hidden bg-forest-900 pb-[var(--section-y)]" aria-labelledby="canopy-title">
      {/* altitude ruler (sticky) */}
      <div className="pointer-events-none absolute inset-y-0 left-[var(--gutter)] hidden w-24 lg:block">
        <div className="sticky top-[20vh] flex h-[60vh] gap-4">
          <div className="relative w-px bg-[var(--milk-15)]">
            <div className="alt-fill absolute inset-0 origin-top bg-gold-300" />
          </div>
          <ul className="flex flex-col justify-between">
            {LAYERS.map((l) => (
              <li key={l.h} className="t-mono leading-tight text-[var(--milk-60)]">
                {l.h}
                <br />
                <span className="text-[var(--milk-40)]">{l.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="gutter pt-[var(--section-y)] lg:pl-[calc(var(--gutter)+8rem)]">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-12">
            <ChapterMark no="02" en="Masters of the Canopy" ru="Хозяева полога" />
          </div>

          {/* hero portrait of the harpy with vertical label */}
          <div className="relative md:col-span-6 md:row-span-2">
            <Photo
              id="harpy-1"
              alt="Гарпия сидит на толстой ветви в кроне леса, Эквадор"
              className="aspect-[3/4] w-full"
              sizes="(min-width:768px) 45vw, 100vw"
              reveal="up"
              parallax={5}
              priority={false}
              credit="below"
            />
            <span className="t-label absolute -right-8 top-6 hidden text-gold-300 [writing-mode:vertical-rl] md:block">
              Harpia harpyja · 45 м над землёй
            </span>
          </div>

          <div className="md:col-span-5 md:col-start-8 md:pt-10">
            <SplitHeading id="canopy-title" className="t-display" mode="chars">
              Masters of the Canopy
            </SplitHeading>
            <Reveal delay={0.2}>
              <p className="t-lead mt-10 text-[var(--milk-80)]">
                На высоте сорока метров лес живёт иначе: больше солнца, ветра и плодов — и меньше права на ошибку.
              </p>
            </Reveal>
          </div>

          <div className="md:col-span-5 md:col-start-8">
            <Reveal>
              <p className="t-body">
                Полог задерживает большую часть солнечного света, поэтому здесь сосредоточены цветение и плодоношение.
                Большинство животных верхних ярусов почти никогда не спускаются на землю: они путешествуют по «мостам» из
                ветвей и лиан, а самые крупные деревья-эмердженты поднимаются над пологом, как острова.
              </p>
              <p className="t-body mt-6">
                Гарпия — главный хищник этого мира. Самки весят 6–9 кг, почти вдвое больше самцов; основу их добычи
                составляют ленивцы и обезьяны. Пара гнездится на гигантах вроде сейбы и выращивает одного птенца раз в
                2–3 года.
              </p>
              <Link href="/animals/harpy-eagle" className="t-label link-u mt-8 inline-block text-gold-300">
                Досье: гарпия →
              </Link>
            </Reveal>
          </div>
        </div>

        {/* asymmetric collage */}
        <div className="mt-32 grid gap-x-8 gap-y-20 md:grid-cols-12">
          {SMALL.map((s, i) => (
            <figure key={s.id} className={`relative ${s.cls}`}>
              <Photo id={s.id} alt={s.alt} className="h-full w-full" sizes={s.sizes} reveal={i % 2 ? "left" : "up"} credit={false} />
              <div className="vline-grow absolute -left-4 top-0 hidden h-full w-px origin-top bg-[var(--milk-15)] md:block" />
              <PhotoCaption id={s.id} />
              <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,rgb(5_12_8/0.85))] p-5 pt-16">
                <p className="t-h3">{s.name}</p>
                <p className="t-small mt-1 max-w-sm text-[var(--milk-80)]">{s.note}</p>
                {s.slug && (
                  <Link href={`/animals/${s.slug}`} className="t-label link-u mt-3 inline-block text-gold-300">
                    Подробнее
                  </Link>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
