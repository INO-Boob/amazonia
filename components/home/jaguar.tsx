"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSettings } from "@/lib/settings";
import { Credit, Photo } from "@/components/ui/photo";
import { SplitHeading } from "@/components/motion/split-heading";
import { ChapterMark } from "./chapter-mark";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    k: "Среда",
    title: "Тень у воды",
    text: "Ягуар держится там, где есть укрытие и вода: в пойменных лесах, на берегах рек и озёр. Он прекрасно плавает и переплывает крупные притоки. Амазония — крупнейший сохранившийся оплот вида.",
    focus: { scale: 1.08, x: 0, y: 0 },
  },
  {
    k: "Охота",
    title: "Укус, которого нет у других кошек",
    text: "Большинство крупных кошек душат добычу, сжимая горло. Ягуар часто убивает укусом в затылок или череп, а его челюсти справляются даже с панцирем речной черепахи и бронёй каймана.",
    focus: { scale: 1.35, x: -6, y: 4 },
  },
  {
    k: "Рацион",
    title: "Более 85 видов добычи",
    text: "Пекари, капибары, тапиры, кайманы, черепахи и их яйца, броненосцы, обезьяны, рыбы. Ягуар — оппортунист: ест то, что многочисленно в конкретном месте и сезоне.",
    focus: { scale: 1.2, x: 6, y: -2 },
  },
  {
    k: "Роль",
    title: "Регулятор всей пирамиды",
    text: "Как высший хищник, ягуар сдерживает численность крупных травоядных и мезохищников. Через них он косвенно влияет на выживание всходов, распространение семян и структуру леса.",
    focus: { scale: 1.12, x: -3, y: -3 },
  },
  {
    k: "Угрозы",
    title: "Близок к уязвимому положению",
    text: "Обезлесение и фрагментация лишают ягуаров территорий; скотоводы отстреливают их из-за нападений на скот; документированы случаи браконьерства ради клыков для нелегальной торговли. Категория IUCN — NT (оценка 2016 г.).",
    focus: { scale: 1, x: 0, y: 0 },
  },
];

export function Jaguar() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const motion = useSettings((s) => s.motion);

  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>("[data-step]");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.step))),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!stage.current) return;
      const f = STEPS[active].focus;
      gsap.to(stage.current, {
        scale: motion ? f.scale : 1,
        xPercent: motion ? f.x : 0,
        yPercent: motion ? f.y : 0,
        duration: motion ? 2.2 : 0,
        ease: "power3.inOut",
      });
    },
    { dependencies: [active, motion] },
  );

  return (
    <section ref={root} id="jaguar" className="relative bg-night" aria-labelledby="jaguar-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={stage} className="absolute inset-0 origin-center will-change-transform">
          <Photo
            id="jaguar-1"
            alt="Ягуар лежит на галечной отмели у края леса, юго-восток Перу"
            className="h-full w-full"
            sizes="100vw"
            credit={false}
            quality={85}
            imgClassName="[filter:saturate(0.85)_contrast(1.08)_brightness(0.82)]"
            objectPosition="62% 45%"
          />
        </div>
        {/* dramatic edges, no heavy processing */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_62%_48%,transparent_20%,rgb(5_12_8/0.7)_65%,rgb(5_12_8/0.97)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(5_12_8/0.9)_0%,transparent_45%)]" />

        <div className="gutter absolute inset-x-0 top-[calc(var(--header-h)+2rem)] flex justify-between">
          <ChapterMark no="03" en="The Silent Predator" ru="Бесшумный охотник" />
          <span className="t-mono hidden text-[var(--milk-40)] md:inline">Panthera onca · 13.1°S 69.7°W</span>
        </div>

        <div className="gutter absolute bottom-10 left-0 flex items-end gap-6">
          <ol className="flex gap-2" aria-label="Шаги рассказа">
            {STEPS.map((s, i) => (
              <li key={s.k} className="flex flex-col gap-2">
                <span className={cn("block h-px w-10 transition-colors duration-700", i <= active ? "bg-gold-300" : "bg-[var(--milk-15)]")} />
                <span className={cn("t-mono transition-colors", i === active ? "text-milk" : "text-[var(--milk-40)]")}>{s.k}</span>
              </li>
            ))}
          </ol>
        </div>
        <Credit id="jaguar-1" className="absolute bottom-4 right-[var(--gutter)]" />
      </div>

      {/* narrative steps scroll over the sticky stage */}
      <div className="relative -mt-[100svh]">
        <div className="gutter flex min-h-[100svh] items-center">
          <div className="max-w-xl pt-24">
            <SplitHeading id="jaguar-title" className="t-mega" mode="chars">
              Ягуар
            </SplitHeading>
            <p className="t-lead mt-6 text-[var(--milk-80)]">
              Единственная большая кошка Нового Света. Её почти невозможно увидеть — но лес всегда знает, что она рядом.
            </p>
          </div>
        </div>
        {STEPS.map((s, i) => (
          <div key={s.k} data-step={i} className="gutter flex min-h-[90svh] items-center">
            <article
              className={cn(
                "max-w-md border-l border-[var(--milk-15)] bg-[rgb(5_12_8/0.55)] py-8 pl-8 pr-6 backdrop-blur-[2px] transition-opacity duration-700",
                active === i ? "opacity-100" : "opacity-40",
              )}
            >
              <p className="t-mono text-gold-300">
                {String(i + 1).padStart(2, "0")} — {s.k}
              </p>
              <h3 className="t-h2 mt-4">{s.title}</h3>
              <p className="t-body mt-5">{s.text}</p>
              {i === STEPS.length - 1 && (
                <Link href="/animals/jaguar" className="t-label link-u mt-6 inline-block text-gold-300">
                  Полное досье ягуара →
                </Link>
              )}
            </article>
          </div>
        ))}
        <div className="h-[30svh]" />
      </div>
    </section>
  );
}
