"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSettings } from "@/lib/settings";
import { Credit, Photo } from "@/components/ui/photo";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { ChapterMark } from "./chapter-mark";

const FACTS = [
  { value: "6–7", unit: "млн км²", label: "площадь бассейна — зависит от того, как проводить границу", src: "SPA 2021" },
  { value: "9", unit: "стран", label: "Бразилия, Перу, Колумбия, Боливия, Эквадор, Венесуэла, Гайана, Суринам и Французская Гвиана", src: "SPA 2021" },
  { value: "~16 000", unit: "видов деревьев", label: "оценка по сети лесных площадок; ~390 млрд деревьев", src: "ter Steege et al. 2013" },
  { value: "2 406", unit: "видов рыб", label: "валидных видов пресноводных рыб описано в бассейне", src: "Jézéquel et al. 2020" },
];

const FORESTS = [
  { name: "Терра-фирме", latin: "terra firme", text: "Незатопляемые леса возвышенных равнин — большая часть Амазонии. Самые богатые видами деревьев леса Земли." },
  { name: "Варзеа", latin: "várzea", text: "Пойменные леса «белых» рек, несущих андийский ил. На месяцы уходят под воду на 10 и более метров." },
  { name: "Игапо", latin: "igapó", text: "Затопляемые леса «чёрных» рек, окрашенных гуминовыми кислотами, — бедные питательными веществами и полные эндемиков." },
];

/**
 * Chapter 1 — a slow panoramic "breath": the photo opens like an iris,
 * then drifts sideways as the reader scrolls.
 */
export function GreenOcean() {
  const root = useRef<HTMLElement>(null);
  const motion = useSettings((s) => s.motion);

  useGSAP(
    () => {
      if (!motion) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(
        q(".pano-track"),
        { xPercent: 0 },
        { xPercent: -14, ease: "none", scrollTrigger: { trigger: q(".pano")[0], start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.from(q(".fact"), {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: q(".facts")[0], start: "top 80%", once: true },
      });
    },
    { scope: root, dependencies: [motion] },
  );

  return (
    <section ref={root} id="green-ocean" className="relative bg-forest-950 pt-[18vh]" aria-labelledby="green-ocean-title">
      <div className="gutter grid gap-10 md:grid-cols-12">
        <ChapterMark no="01" en="The Green Ocean" ru="Зелёный океан" className="md:col-span-12" />
        <SplitHeading as="h2" id="green-ocean-title" className="t-display md:col-span-9" mode="lines">
          Лес, у которого нет горизонта
        </SplitHeading>
      </div>

      {/* wide panorama with drifting crop */}
      <div className="pano relative mt-16 h-[62vh] min-h-[380px] overflow-hidden md:h-[78vh]">
        <div className="pano-track absolute inset-y-0 left-0 w-[118%]">
          <Photo
            id="euterpe-2"
            alt="Пальма асаи (Euterpe precatoria) поднимается над сплошным пологом леса, Ясуни, Эквадор"
            className="h-full w-full"
            sizes="120vw"
            reveal="iris"
            credit={false}
            quality={85}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--forest-950)_0%,transparent_18%,transparent_75%,var(--forest-950)_100%)]" />
        <p className="t-mono absolute bottom-6 left-[var(--gutter)] text-[var(--milk-60)]">
          Полог леса · Ясуни, Эквадор · 0.0°S 76.2°W
        </p>
        <Credit id="euterpe-2" className="absolute bottom-6 right-[var(--gutter)]" />
      </div>

      <div className="gutter section-y grid gap-16 md:grid-cols-12">
        <blockquote className="md:col-span-7 md:col-start-2">
          <Reveal variant="blur" duration={1.6}>
            <p className="t-lead text-[clamp(1.6rem,3vw,2.8rem)] leading-[1.2] text-milk">
              «Здесь лес не заканчивается у горизонта. Он поднимается над реками, скрывает тысячи историй и создаёт
              собственный мир, где каждый звук, движение и капля воды имеют значение».
            </p>
          </Reveal>
        </blockquote>
        <div className="md:col-span-3 md:col-start-10 md:pt-24">
          <Reveal>
            <p className="t-body">
              Амазония — это не один лес, а мозаика: незатопляемые леса и поймы, болота пальмы бурити, саванные острова,
              предгорья Анд и древние плато Гвианского щита. Её связывает вода — от ливней над пологом до самой
              полноводной реки мира.
            </p>
          </Reveal>
        </div>
      </div>

      {/* scientific metadata strip */}
      <div className="facts gutter">
        <div className="grid border-y border-[var(--milk-15)] sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f, i) => (
            <div key={f.label} className={`fact flex flex-col justify-between gap-8 py-10 sm:px-6 ${i ? "lg:border-l" : ""} border-[var(--milk-15)] ${i % 2 ? "sm:border-l" : ""} ${i > 1 ? "border-t sm:border-t lg:border-t-0" : i === 1 ? "border-t sm:border-t-0" : ""}`}>
              <p className="flex items-baseline gap-3">
                <span className="font-display text-[clamp(3rem,5vw,4.6rem)] font-light leading-none text-milk">{f.value}</span>
                <span className="t-label text-gold-300">{f.unit}</span>
              </p>
              <div>
                <p className="t-small">{f.label}</p>
                <p className="t-mono mt-3 text-[var(--milk-40)]">src: {f.src}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* three forests — offset editorial columns */}
      <div className="gutter section-y grid items-start gap-14 md:grid-cols-12">
        <div className="relative md:col-span-5">
          <Photo
            id="euterpe-1"
            alt="Чёрная вода лесного ручья, окружённого густой растительностью, Эквадор"
            className="aspect-[4/5] w-full"
            sizes="(min-width: 768px) 40vw, 100vw"
            parallax={6}
            reveal="up"
          />
          <p className="t-mono mt-4 text-[var(--milk-40)]">Ручей чёрной воды · Ясуни, Эквадор</p>
        </div>
        <div className="md:col-span-6 md:col-start-7 md:pt-32">
          <h3 className="t-h2 max-w-md">Три леса одного бассейна</h3>
          <ol className="mt-12 space-y-10">
            {FORESTS.map((f, i) => (
              <Reveal as="li" key={f.name} delay={i * 0.08} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-[var(--milk-15)] pt-6">
                <span className="t-mono text-gold-300">0{i + 1}</span>
                <div>
                  <p className="t-h3">
                    {f.name} <span className="t-latin text-[var(--milk-40)]">— {f.latin}</span>
                  </p>
                  <p className="t-body mt-3">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
