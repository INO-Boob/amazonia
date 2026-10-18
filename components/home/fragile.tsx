"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSettings } from "@/lib/settings";
import { prodes } from "@/data/deforestation";
import { source } from "@/data/sources";
import { Photo } from "@/components/ui/photo";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { ChapterMark } from "./chapter-mark";
import { cn } from "@/lib/utils";

const THREATS = [
  {
    title: "Обезлесение",
    text: "Главная причина — расчистка под пастбища, а также соевые поля, дороги и незаконные рубки. По оценке Science Panel for the Amazon (2021), около 17 % амазонских лесов уже превращены в другие типы земель.",
    src: "spa-2021",
  },
  {
    title: "Деградация и фрагментация",
    text: "Ещё как минимум 17 % лесов деградированы: выборочные рубки, пожары и «краевой эффект» оставляют лес стоять, но обедняют его. Разрезанные дорогами массивы теряют крупных хищников и распространителей семян.",
    src: "spa-2021",
  },
  {
    title: "Пожары и засухи",
    text: "Во влажном тропическом лесу естественные пожары редки, поэтому деревья плохо к ним приспособлены. В 2023–2024 годах экстремальная засуха привела к рекордно низкому уровню Риу-Негру у Манауса — минимуму за всю историю наблюдений с 1902 года.",
    src: "manaus-2024",
  },
  {
    title: "Загрязнение рек",
    text: "Кустарная золотодобыча сбрасывает ртуть, которая накапливается в рыбе и хищниках — дельфинах, выдрах, людях. Плотины ГЭС меняют сезонные паводки, от которых зависит вся жизнь пойм.",
    src: "spa-2021",
  },
  {
    title: "Изменение климата",
    text: "В 2023 году в озере Тефе при засухе вода прогрелась выше 39 °C, и за несколько недель погибли более ста речных дельфинов. По оценке Flores et al. (2024), к 2050 году 10–47 % лесов Амазонии могут подвергнуться сочетанию нарушений, способных перевести экосистему в иное состояние.",
    src: "flores-2024",
  },
];

function Chart() {
  const ref = useRef<SVGSVGElement>(null);
  const motion = useSettings((s) => s.motion);
  const [hover, setHover] = useState<number | null>(null);
  const max = 28000;
  const W = 880;
  const H = 300;
  const bw = W / prodes.length;

  useGSAP(
    () => {
      if (!motion || !ref.current) return;
      gsap.from(ref.current.querySelectorAll(".bar"), {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.035,
        scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
      });
    },
    { dependencies: [motion] },
  );

  const h = hover ?? prodes.length - 1;
  const d = prodes[h];

  return (
    <figure>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <figcaption className="t-label text-[var(--milk-60)]">Вырубка в Легальной Амазонии Бразилии, км² в год · INPE PRODES</figcaption>
        <p className="t-mono text-[var(--milk-80)]" aria-live="polite">
          {d.year}: <span className="text-rust-400">{d.km2.toLocaleString("ru-RU")} км²</span>
          {d.estimate && " (оценка)"}
        </p>
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H + 30}`} className="mt-6 h-auto w-full" role="img" aria-label="Столбчатая диаграмма годовой вырубки 2004–2025: пик 27 772 км² в 2004 году, минимум 4 571 км² в 2012 году, рост до 13 038 км² в 2021 году и снижение до 5 796 км² в 2025 году.">
        {[0, 10000, 20000].map((v) => (
          <g key={v}>
            <line x1={0} x2={W} y1={H - (v / max) * H} y2={H - (v / max) * H} stroke="rgb(239 232 216 / 0.1)" />
            <text x={0} y={H - (v / max) * H - 6} className="fill-[var(--milk-40)] font-mono" style={{ fontSize: 11 }}>
              {v.toLocaleString("ru-RU")}
            </text>
          </g>
        ))}
        {prodes.map((p, i) => {
          const bh = (p.km2 / max) * H;
          return (
            <g key={p.year} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={i * bw} y={0} width={bw} height={H} fill="transparent" />
              <rect
                className="bar"
                x={i * bw + bw * 0.18}
                y={H - bh}
                width={bw * 0.64}
                height={bh}
                fill={i === h ? "#c46a45" : p.estimate ? "rgb(196 106 69 / 0.45)" : "rgb(239 232 216 / 0.55)"}
              />
              {(i % 3 === 0 || i === prodes.length - 1) && (
                <text x={i * bw + bw / 2} y={H + 20} textAnchor="middle" className="fill-[var(--milk-40)] font-mono" style={{ fontSize: 11 }}>
                  {p.year}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="t-mono mt-4 text-[var(--milk-40)]">
        Год PRODES — с 1 августа по 31 июля. 2025 — предварительная оценка INPE от 15.10.2025.{" "}
        <a className="link-u text-[var(--milk-60)]" href={source("prodes-series").url} target="_blank" rel="noopener noreferrer">
          TerraBrasilis
        </a>
      </p>
    </figure>
  );
}

export function Fragile() {
  const [open, setOpen] = useState(0);
  return (
    <section id="threats" className="relative bg-[#16130d] py-[var(--section-y)]" aria-labelledby="threats-title">
      <div className="gutter grid gap-12 md:grid-cols-12">
        <div className="md:col-span-12">
          <ChapterMark no="08" en="A Fragile Paradise" ru="Хрупкий рай" tone="rust" />
        </div>
        <div className="md:col-span-6">
          <SplitHeading id="threats-title" className="t-display" mode="lines">
            Хрупкий рай
          </SplitHeading>
          <Reveal>
            <p className="t-lead mt-8 max-w-lg text-[var(--milk-80)]">
              Амазония огромна, но не бесконечна. Учёные предупреждают о переломной точке, за которой часть леса может
              превратиться в деградированную саванну.
            </p>
          </Reveal>
        </div>
        <div className="relative md:col-span-5 md:col-start-8">
          <Photo
            id="ceiba-2"
            alt="Одинокая сейба возвышается над лесом на берегу реки, Эквадор"
            className="aspect-[3/4] w-full"
            sizes="(min-width:768px) 40vw, 100vw"
            reveal="iris"
            imgClassName="[filter:saturate(0.6)_sepia(0.15)]"
          />
        </div>
      </div>

      <div className="gutter mt-24 grid gap-4 border-y border-[var(--milk-15)] py-12 sm:grid-cols-3">
        {[
          ["≈17 %", "лесов Амазонии уже уничтожено", "SPA 2021"],
          ["≥17 %", "деградировано", "SPA 2021"],
          ["10–47 %", "лесов под угрозой сочетания нарушений к 2050 г.", "Flores et al. 2024"],
        ].map(([v, l, s]) => (
          <Reveal key={l} className="sm:px-4">
            <p className="font-display text-[clamp(3rem,6vw,5.5rem)] font-light leading-none text-rust-400">{v}</p>
            <p className="t-small mt-3">{l}</p>
            <p className="t-mono mt-2 text-[var(--milk-40)]">{s}</p>
          </Reveal>
        ))}
      </div>

      <div className="gutter mt-24 grid gap-16 lg:grid-cols-12">
        <ol className="lg:col-span-5">
          {THREATS.map((t, i) => (
            <li key={t.title} className="border-b border-[var(--milk-15)]">
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(i)}
                className="flex w-full items-baseline gap-5 py-5 text-left"
              >
                <span className={cn("t-mono", open === i ? "text-rust-400" : "text-[var(--milk-40)]")}>0{i + 1}</span>
                <span className={cn("t-h3 transition-colors", open === i ? "text-milk" : "text-[var(--milk-60)] hover:text-milk")}>{t.title}</span>
              </button>
              <div className={cn("grid transition-[grid-template-rows] duration-700", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="t-body pb-6 pl-10">{t.text}</p>
                  <a href={source(t.src).url} target="_blank" rel="noopener noreferrer" className="t-mono link-u mb-6 ml-10 inline-block text-[var(--milk-40)]">
                    Источник: {source(t.src).publisher}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="lg:col-span-7">
          <Chart />
          <Reveal>
            <p className="t-body mt-10">
              Темпы вырубки в Бразилии резко упали после 2004 года, снова выросли в 2019–2021 годах и затем снизились: по
              предварительной оценке INPE, за сезон 2024/25 вырублено 5 796 км² — на 11 % меньше, чем годом ранее. Это
              хорошая новость, но каждый год лес всё равно теряет площадь, сравнимую с несколькими крупными городами.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
