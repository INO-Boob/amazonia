"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { useQualityTier, useSettings } from "@/lib/settings";
import { LazyForest } from "@/components/three/lazy";
import { scrollToId } from "@/components/motion/smooth-scroll";
import { asset, cn } from "@/lib/utils";

const POSTER = asset("/assets/posters/hero-forest.jpg");

/**
 * CINEMATIC JUNGLE — full-screen WebGL rainforest with a static poster
 * that is shown immediately and cross-fades once the scene renders.
 * The section is 220vh tall; the stage is sticky, so native scrolling
 * drives the camera deeper into the forest (no scroll-jacking).
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const tier = useQualityTier();
  const motion = useSettings((s) => s.motion);
  const hydrated = useSettings((s) => s.hydrated);
  // "ready" is tracked per tier, so switching quality shows the poster again until the new scene renders
  const [readyTier, setReadyTier] = useState<string | null>(null);
  const ready = readyTier === tier;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Multi-stage intro: darkness → light bloom → stage reveal → kinetic title → UI.
  useGSAP(
    () => {
      if (!hydrated) return;
      const q = gsap.utils.selector(section);
      if (!motion) {
        gsap.set(q(".hero-fade, .hero-ui"), { autoAlpha: 1 });
        gsap.set(title.current, { autoAlpha: 1 });
        return;
      }
      let split: SplitText | undefined;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(q(".hero-curtain"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 2.2, ease: "power2.inOut" }, 0)
        .fromTo(q(".hero-bloom"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 3.2, ease: "power2.out" }, 0.2)
        .fromTo(q(".hero-stage"), { scale: 1.18, filter: "brightness(0.35) saturate(0.6)" }, { scale: 1, filter: "brightness(1) saturate(1)", duration: 3.6, ease: "power3.out" }, 0);

      const runTitle = () => {
        if (!title.current) return;
        split = SplitText.create(title.current, { type: "lines,chars", mask: "lines" });
        gsap.set(title.current, { autoAlpha: 1 });
        tl.from(split.chars, { yPercent: 115, rotate: 6, duration: 1.6, stagger: 0.035 }, 0.9);
        tl.fromTo(q(".hero-fade"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.12 }, 1.7);
        tl.fromTo(q(".hero-ui"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, stagger: 0.08 }, 2.2);
      };
      if (document.fonts?.ready) document.fonts.ready.then(runTitle);
      else runTitle();

      // Scroll: drive the camera and hand over to chapter 1.
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => (progress.current = self.progress),
      });
      gsap.to(q(".hero-copy"), {
        yPercent: -30,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "45% top", scrub: true },
      });
      gsap.fromTo(
        q(".hero-exit"),
        { autoAlpha: 0 },
        { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: section.current, start: "55% top", end: "bottom top", scrub: true } },
      );
      return () => split?.revert();
    },
    { scope: section, dependencies: [hydrated, motion] },
  );

  return (
    <section ref={section} id="top" className="relative h-[220vh]" aria-labelledby="hero-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-forest-950">
        <div className="hero-stage absolute inset-0 will-change-transform">
          <Image
            src={POSTER}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={75}
            className={cn("object-cover transition-opacity duration-[1600ms]", ready ? "opacity-0" : "opacity-100")}
          />
          {tier !== "poster" && (
            <LazyForest
              tier={tier}
              progress={progress}
              pointer={pointer}
              animate={motion}
              onReady={() => setReadyTier(tier)}
              className={cn("absolute inset-0 transition-opacity duration-[1600ms]", ready ? "opacity-100" : "opacity-0")}
            />
          )}
        </div>

        {/* colour grade & atmosphere */}
        <div className="hero-bloom pointer-events-none absolute -right-[10%] -top-[20%] h-[90%] w-[70%] bg-[radial-gradient(closest-side,rgb(255_222_160/0.35),transparent)] mix-blend-screen" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(5_12_8/0.55)_0%,transparent_28%,rgb(7_18_12/0.25)_45%,rgb(7_18_12/0.92)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(5_12_8/0.55)_0%,transparent_65%)]" />
        <div className="vignette pointer-events-none absolute inset-0 opacity-80" />
        <div className="hero-exit pointer-events-none absolute inset-0 bg-forest-950 opacity-0" />
        <div className="hero-curtain pointer-events-none absolute inset-0 bg-night" />

        {/* meta */}
        <div className="hero-ui gutter t-mono pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+1.25rem)] flex justify-between text-[var(--milk-60)] opacity-0">
          <span>EXPEDITION 01 — БАССЕЙН АМАЗОНКИ</span>
          <span className="hidden sm:inline">ch. 00 / cinematic jungle</span>
        </div>
        <div className="hero-ui t-mono pointer-events-none absolute right-[var(--gutter)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap text-[0.62rem] text-[var(--milk-40)] opacity-0 [writing-mode:vertical-rl] lg:block">
          Brasil · Perú · Colombia · Bolivia · Ecuador · Venezuela · Guyana · Suriname · Guyane
        </div>

        <div className="hero-copy gutter absolute inset-x-0 bottom-[14vh] sm:bottom-[16vh]">
          <p className="hero-fade t-label mb-6 text-gold-300 opacity-0">The Living Rainforest</p>
          <h1 id="hero-title" ref={title} className="t-mega max-w-[12ch] text-milk opacity-0 [text-shadow:0_2px_40px_rgb(0_0_0/0.35)]">
            The Rainforest is Alive
          </h1>
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="hero-fade t-body max-w-[38rem] text-[var(--milk-80)] opacity-0">
              Крупнейший тропический лес планеты — 6–7 млн км² в девяти странах. Около 16 тысяч видов деревьев,
              тысячи видов рыб, птиц и млекопитающих и бесчисленные беспозвоночные, многие из которых ещё не описаны
              наукой.
            </p>
            <button
              type="button"
              onClick={() => scrollToId("green-ocean")}
              className="hero-fade group t-label inline-flex w-fit items-center gap-4 border border-[var(--milk-40)] px-7 py-4 text-milk opacity-0 transition-colors duration-500 hover:border-gold-300 hover:bg-gold-300 hover:text-forest-950"
            >
              Начать экспедицию
              <ArrowDown size={16} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-y-1" />
            </button>
          </div>
        </div>

        <div className="hero-ui gutter pointer-events-none absolute inset-x-0 bottom-6 flex items-end justify-between opacity-0">
          <span className="t-mono text-[var(--milk-40)]">3°27′S · 62°13′W</span>
          <span className="flex flex-col items-center gap-3">
            <span className="t-mono text-[var(--milk-60)]">scroll</span>
            <span className="relative block h-12 w-px overflow-hidden bg-[var(--milk-15)]">
              <span className="scroll-cue absolute left-0 top-0 h-1/2 w-px bg-gold-300" />
            </span>
          </span>
          <span className="t-mono text-[var(--milk-40)]">{tier === "poster" ? "static" : `webgl · ${tier}`}</span>
        </div>
      </div>
    </section>
  );
}
