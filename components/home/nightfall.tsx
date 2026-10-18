"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useQualityTier, useSettings } from "@/lib/settings";
import { LazyFireflies } from "@/components/three/lazy";
import { Credit, Photo } from "@/components/ui/photo";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { useSoundZone } from "@/components/layout/sound-engine";
import { photo, type PhotoKey } from "@/data/photos";
import { ChapterMark } from "./chapter-mark";

const NIGHT: { id: PhotoKey; name: string; latin: string; text: string; slug?: string }[] = [
  { id: "aotus-1", name: "Ночные обезьяны", latin: "Aotus vociferans", text: "Единственные по-настоящему ночные обезьяны мира. Огромные глаза собирают слабый лунный свет; днём семья спит в дупле." },
  { id: "potoo-1", name: "Потоо", latin: "Nyctibius griseus", text: "Днём притворяется обломком ветки, ночью охотится на насекомых. Его печальная песня — один из самых узнаваемых ночных звуков.", slug: "potoo" },
  { id: "kinkajou-2", name: "Кинкажу", latin: "Potos flavus", text: "Енотовое с цепким хвостом. Кочует по кронам от плода к плоду и пьёт нектар.", slug: "kinkajou" },
  { id: "corallus-1", name: "Садовый удав", latin: "Corallus hortulana", text: "Термочувствительные ямки на губах помогают находить в темноте спящих птиц и летучих мышей." },
];

const COMPARE = [
  ["Свет", "Полог гасит большую часть солнца; цвет и узор — сигналы", "Лунный свет и биолюминесценция; важнее слух, обоняние, тепло"],
  ["Звук", "Птицы, цикады, крики обезьян на рассвете", "Хоры лягушек, сверчки, совы, потоо"],
  ["Хищники", "Гарпия, ягуар (активен в любое время)", "Ягуар, удавы, кошки поменьше, совы"],
  ["Стратегия", "Яркость или маскировка на свету", "Большие глаза, тепловые сенсоры, эхолокация летучих мышей"],
];

/** Pointer "torch": reveals a night photo through a soft circular mask. */
function Torch({ id, alt }: { id: PhotoKey; alt: string }) {
  const p = photo(id);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 45 });
  const [lit, setLit] = useState(false);
  return (
    <div
      ref={ref}
      className="relative aspect-[4/5] w-full overflow-hidden bg-night"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onPointerEnter={() => setLit(true)}
      onPointerLeave={() => setLit(false)}
      onFocus={() => setLit(true)}
      onBlur={() => setLit(false)}
      tabIndex={0}
      role="img"
      aria-label={`${alt}. Наведите фонарик, чтобы увидеть животное.`}
    >
      <Image src={p.src} alt="" fill sizes="(min-width:768px) 25vw, 50vw" placeholder="blur" blurDataURL={p.blur} className="object-cover brightness-[0.16] saturate-0" />
      <div
        className="absolute inset-0 transition-[clip-path] duration-500 ease-out"
        style={{ clipPath: `circle(${lit ? 38 : 0}% at ${pos.x}% ${pos.y}%)` }}
      >
        <Image src={p.src} alt="" fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover" />
      </div>
    </div>
  );
}

export function Nightfall() {
  const root = useRef<HTMLElement>(null);
  const tier = useQualityTier();
  const motion = useSettings((s) => s.motion);
  const soundOn = useSettings((s) => s.soundOn);
  const setSound = useSettings((s) => s.setSound);
  useSoundZone(root, "night");

  useGSAP(
    () => {
      if (!motion) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(q(".dusk"), { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: q(".night-stage")[0], start: "top bottom", end: "top top", scrub: true } });
    },
    { scope: root, dependencies: [motion] },
  );

  return (
    <section ref={root} id="nightfall" className="relative bg-night" aria-labelledby="night-title">
      <div className="night-stage relative h-[100svh] min-h-[640px] overflow-hidden">
        <Photo id="iriartea-2" alt="Пальма Iriartea на фоне Млечного Пути над тёмным лесом, Эквадор" className="absolute inset-0" sizes="100vw" credit={false} quality={85} parallax={4} />
        <div className="dusk pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0f2218_0%,#2a3a2a_50%,#3b3a28_100%)] mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(5_12_8/0.3)_0%,transparent_40%,rgb(5_12_8/0.95)_100%)]" />
        {tier !== "poster" && <LazyFireflies tier={tier} animate={motion} className="absolute inset-0" />}

        <div className="gutter absolute inset-x-0 top-[calc(var(--header-h)+2rem)]">
          <ChapterMark no="06" en="Nightfall" ru="Ночь" tone="moon" />
        </div>
        <div className="gutter absolute bottom-[10vh] left-0 right-0 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <SplitHeading id="night-title" className="t-mega" mode="chars">
              Nightfall
            </SplitHeading>
          </div>
          <div className="self-end md:col-span-4 md:col-start-9">
            <p className="t-body">
              На экваторе темнеет быстро: сумерки длятся считаные минуты. Дневной хор птиц сменяют лягушки, сверчки и
              цикады, а лес наполняется жизнью, которую днём почти невозможно увидеть.
            </p>
            <button
              type="button"
              onClick={() => setSound(!soundOn)}
              className="t-label mt-6 inline-flex items-center gap-3 border border-[var(--milk-40)] px-5 py-3 transition-colors hover:border-[#c9d3e0] hover:bg-[#c9d3e0] hover:text-night"
              aria-pressed={soundOn}
            >
              {soundOn ? "Выключить звуки ночи" : "Включить звуки ночного леса"}
            </button>
          </div>
        </div>
        <Credit id="iriartea-2" className="absolute bottom-4 right-[var(--gutter)]" />
      </div>

      <div className="gutter py-[var(--section-y)]">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="t-lead text-[#c9d3e0]">Ночь — не пауза, а вторая смена</p>
          </Reveal>
          <Reveal className="md:col-span-5 md:col-start-8" delay={0.1}>
            <p className="t-body">
              Многие обитатели Амазонии активны только в темноте: так легче избежать перегрева, сохранить влагу и не попасть
              на глаза дневным хищникам. Ночные животные полагаются на огромные глаза, тонкий слух, обоняние и даже
              тепловое «зрение». В кронах вспыхивают светляки и щелкуны, а над реками охотятся летучие мыши-рыболовы.
            </p>
          </Reveal>
        </div>

        <p className="t-label mt-24 text-[var(--milk-40)]">Наведите фонарик на кадр</p>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {NIGHT.map((n, i) => (
            <figure key={n.id} className={i % 2 ? "md:mt-20" : ""}>
              <Torch id={n.id} alt={`${n.name} (${n.latin})`} />
              <figcaption className="mt-4">
                <p className="t-h3">{n.name}</p>
                <p className="t-latin text-[var(--milk-60)]">{n.latin}</p>
                <p className="t-small mt-2">{n.text}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  {n.slug ? (
                    <Link href={`/animals/${n.slug}`} className="t-label link-u text-[#c9d3e0]">
                      Досье →
                    </Link>
                  ) : (
                    <span />
                  )}
                  <Credit id={n.id} />
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* day vs night */}
        <div className="mt-[var(--section-y)] overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="t-label mb-6 text-left text-[var(--milk-40)]">День и ночь в одном лесу</caption>
            <thead>
              <tr className="border-b border-[var(--milk-15)]">
                <th className="t-mono w-40 py-4 font-normal text-[var(--milk-40)]" scope="col"></th>
                <th className="t-label py-4 text-gold-300" scope="col">День</th>
                <th className="t-label py-4 text-[#c9d3e0]" scope="col">Ночь</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([k, d, n]) => (
                <tr key={k} className="border-b border-[var(--milk-08)] align-top">
                  <th scope="row" className="t-mono py-5 pr-6 font-normal text-[var(--milk-60)]">{k}</th>
                  <td className="t-small py-5 pr-8 text-[var(--milk-80)]">{d}</td>
                  <td className="t-small py-5 text-[var(--milk-80)]">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
