"use client";

import Image from "next/image";
import { useRef } from "react";
import { photo as getPhoto, type PhotoKey } from "@/data/photos";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface Props {
  id: PhotoKey;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Vertical parallax amplitude in % of the frame (0 = none). */
  parallax?: number;
  /** Reveal the frame with a clip-path wipe when it enters the viewport. */
  reveal?: "up" | "left" | "right" | "iris" | false;
  credit?: "overlay" | "below" | false;
  objectPosition?: string;
  quality?: 60 | 75 | 85;
}

/**
 * Responsive local photograph (next/image → AVIF/WebP, blur placeholder),
 * with optional scroll parallax, mask reveal and CC attribution.
 */
export function Photo({
  id,
  alt,
  className,
  imgClassName,
  sizes = "100vw",
  priority,
  parallax = 0,
  reveal = false,
  credit = "overlay",
  objectPosition,
  quality = 75,
}: Props) {
  const p = getPhoto(id);
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const motion = useSettings((s) => s.motion);

  useGSAP(
    () => {
      if (!motion || !frame.current || !inner.current) return;
      if (parallax) {
        gsap.fromTo(
          inner.current,
          { yPercent: -parallax },
          { yPercent: parallax, ease: "none", scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      }
      if (reveal) {
        const from = {
          up: "inset(100% 0% 0% 0%)",
          left: "inset(0% 100% 0% 0%)",
          right: "inset(0% 0% 0% 100%)",
          iris: "inset(18% 18% 18% 18%)",
        }[reveal];
        gsap.fromTo(
          frame.current,
          { clipPath: from },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: frame.current, start: "top 85%", once: true } },
        );
        gsap.fromTo(inner.current, { scale: 1.25 }, { scale: 1, duration: 2.2, ease: "expo.out", scrollTrigger: { trigger: frame.current, start: "top 85%", once: true } });
      }
    },
    { dependencies: [motion, parallax, reveal] },
  );

  const pad = parallax ? `${parallax * 2}%` : "0%";

  return (
    <figure className={cn(/\b(absolute|fixed)\b/.test(className ?? "") ? "" : "relative", className)}>
      <div ref={frame} className="absolute inset-0 overflow-hidden">
        <div ref={inner} className="absolute inset-x-0 will-change-transform" style={{ top: `-${pad}`, bottom: `-${pad}` }}>
          <Image
            src={p.src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            quality={quality}
            placeholder="blur"
            blurDataURL={p.blur}
            className={cn("object-cover", imgClassName)}
            style={objectPosition ? { objectPosition } : undefined}
          />
        </div>
      </div>
      {credit === "overlay" && (
        <figcaption className="t-mono pointer-events-auto absolute bottom-2 right-3 z-[2] max-w-[90%] truncate text-[0.6rem] text-[var(--milk-60)] [text-shadow:0_1px_6px_rgb(0_0_0/0.8)]">
          <a href={p.photoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-milk">
            © {p.author} · {p.license}
          </a>
        </figcaption>
      )}
      {credit === "below" && <PhotoCaption id={id} />}
    </figure>
  );
}

export function PhotoCaption({ id, className }: { id: PhotoKey; className?: string }) {
  const p = getPhoto(id);
  return (
    <figcaption className={cn("t-mono absolute -bottom-7 left-0 right-0 flex justify-between gap-4 text-[0.62rem] text-[var(--milk-40)]", className)}>
      <span className="truncate italic">{p.taxon}</span>
      <a href={p.photoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 hover:text-milk">
        © {p.author} · {p.license}
      </a>
    </figcaption>
  );
}

export function Credit({ id, className }: { id: PhotoKey; className?: string }) {
  const p = getPhoto(id);
  return (
    <a
      href={p.photoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("t-mono text-[0.6rem] text-[var(--milk-40)] transition-colors hover:text-milk", className)}
    >
      © {p.author} · {p.license} · iNaturalist
    </a>
  );
}
