"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSettings } from "@/lib/settings";
import { organizations } from "@/data/sources";
import { Credit, Photo } from "@/components/ui/photo";
import { SplitHeading } from "@/components/motion/split-heading";
import { ChapterMark } from "./chapter-mark";

const ROUTES = [
  { href: "/animals", no: "II", title: "Каталог животных", text: "21 вид: досье, ареалы, природоохранные статусы" },
  { href: "/map", no: "III", title: "Карта Амазонии", text: "Реки, поймы, Гвианский щит и предгорья Анд" },
  { href: "/sources", no: "IV", title: "Источники", text: "Научная литература, авторы фотографий и лицензии" },
];

export function Expedition() {
  const root = useRef<HTMLElement>(null);
  const motion = useSettings((s) => s.motion);

  useGSAP(
    () => {
      if (!motion) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(
        q(".finale-frame"),
        { clipPath: "inset(12% 22% 12% 22%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: q(".finale")[0], start: "top 90%", end: "top top", scrub: true } },
      );
      gsap.fromTo(q(".finale-img"), { scale: 1.35 }, { scale: 1, ease: "none", scrollTrigger: { trigger: q(".finale")[0], start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root, dependencies: [motion] },
  );

  return (
    <section ref={root} id="expedition" className="relative bg-forest-950" aria-labelledby="finale-title">
      <div className="finale relative h-[150svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="finale-frame absolute inset-0 overflow-hidden">
            <div className="finale-img absolute inset-0">
              <Photo id="mauritia-1" alt="Пальмы бурити и асаи над рекой в Перуанской Амазонии под облачным небом" className="h-full w-full" sizes="100vw" credit={false} quality={85} />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_18_12/0.4)_0%,transparent_35%,rgb(7_18_12/0.85)_100%)]" />
          </div>
          <div className="gutter absolute inset-x-0 top-[calc(var(--header-h)+2rem)]">
            <ChapterMark no="09" en="Enter the Expedition" ru="Экспедиция продолжается" />
          </div>
          <div className="gutter absolute bottom-[10vh] left-0 right-0">
            <SplitHeading id="finale-title" className="t-mega max-w-[14ch]" mode="lines">
              Лес, который дышит за континент
            </SplitHeading>
          </div>
          <Credit id="mauritia-1" className="absolute bottom-4 right-[var(--gutter)]" />
        </div>
      </div>

      <div className="gutter pb-[var(--section-y)]">
        <div className="grid gap-12 md:grid-cols-12">
          <p className="t-lead md:col-span-6">
            Амазония возвращает в атмосферу огромные объёмы влаги, которая выпадает дождями далеко за её пределами — вплоть до юга Бразилии и бассейна Ла-Платы. Она хранит огромные запасы углерода и остаётся домом для
            сотен коренных народов и бесчисленных видов. Её будущее решается сейчас — в науке, политике и выборе каждого.
          </p>
        </div>

        <nav aria-label="Продолжить экспедицию" className="mt-20 border-t border-[var(--milk-15)]">
          {ROUTES.map((r) => (
            <Link key={r.href} href={r.href} className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-[var(--milk-15)] py-8 md:grid-cols-[5rem_1fr_1fr_auto]">
              <span className="t-mono text-gold-300">{r.no}</span>
              <span className="t-h1 transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-4">{r.title}</span>
              <span className="t-small hidden md:block">{r.text}</span>
              <ArrowUpRight className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.2} />
            </Link>
          ))}
        </nav>

        <div className="mt-24 grid gap-10 md:grid-cols-12">
          <p className="t-label text-[var(--milk-40)] md:col-span-3">Кто защищает Амазонию</p>
          <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 md:col-span-9 lg:grid-cols-3">
            {organizations.map((o) => (
              <li key={o.name}>
                <a href={o.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <span className="link-u text-milk">{o.name}</span>
                  <span className="t-small mt-1 block">{o.note}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
