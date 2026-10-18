"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { edges, KIND_LABEL, nodes, type NodeKind } from "@/data/ecosystem";
import { SplitHeading } from "@/components/motion/split-heading";
import { ChapterMark } from "./chapter-mark";
import { cn } from "@/lib/utils";

const KIND_COLOR: Record<NodeKind, string> = {
  abiotic: "#8cc7bd",
  plant: "#86a067",
  herbivore: "#e3c58b",
  disperser: "#cfa45a",
  predator: "#c46a45",
  decomposer: "#a5835e",
};

/** Curved edge path between two nodes. */
function arc(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const k = 0.18;
  return `M${a.x},${a.y} Q${mx - dy * k},${my + dx * k} ${b.x},${b.y}`;
}

export function Ecosystem() {
  const [sel, setSel] = useState("trees");
  const [hover, setHover] = useState<string | null>(null);
  const focus = hover ?? sel;
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), []);
  const related = useMemo(() => {
    const set = new Set<string>([focus]);
    edges.forEach((e) => (e.from === focus || e.to === focus) && (set.add(e.from), set.add(e.to)));
    return set;
  }, [focus]);
  const node = byId[sel];
  const links = edges.filter((e) => e.from === sel || e.to === sel);

  return (
    <section id="ecosystem" className="relative bg-forest-850 py-[var(--section-y)]" aria-labelledby="eco-title">
      <div className="gutter">
        <ChapterMark no="07" en="A Living Ecosystem" ru="Живая система" />
        <div className="mt-10 grid gap-10 md:grid-cols-12">
          <SplitHeading id="eco-title" className="t-display md:col-span-7" mode="lines">
            Всё связано со всем
          </SplitHeading>
          <p className="t-body md:col-span-4 md:col-start-9 md:pt-6">
            Это упрощённая схема задокументированных связей: кто кого ест, кто переносит семена, как вода и лес управляют
            друг другом. Выберите узел — и увидите его роль.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="relative lg:col-span-8">
            <svg viewBox="0 0 1000 660" className="h-auto w-full" role="group" aria-label="Схема связей экосистемы Амазонии">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
                </marker>
              </defs>
              {edges.map((e) => {
                const a = byId[e.from];
                const b = byId[e.to];
                const on = e.from === focus || e.to === focus;
                return (
                  <path
                    key={e.from + e.to}
                    d={arc(a, b)}
                    fill="none"
                    stroke={on ? KIND_COLOR[byId[e.from].kind] : "rgb(239 232 216 / 0.12)"}
                    strokeWidth={on ? 1.6 : 1}
                    strokeDasharray={on ? "4 6" : undefined}
                    className={cn("transition-[stroke] duration-500", on && "eco-flow")}
                    style={{ color: on ? KIND_COLOR[byId[e.from].kind] : "rgb(239 232 216 / 0.2)" }}
                    markerEnd="url(#arrow)"
                  />
                );
              })}
              {nodes.map((n) => {
                const on = related.has(n.id);
                const active = n.id === sel;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x},${n.y})`}
                    className="cursor-pointer outline-none"
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    aria-label={`${n.label}: ${KIND_LABEL[n.kind]}`}
                    onClick={() => setSel(n.id)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSel(n.id))}
                    onPointerEnter={() => setHover(n.id)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(n.id)}
                    onBlur={() => setHover(null)}
                    style={{ opacity: on ? 1 : 0.32, transition: "opacity .5s" }}
                  >
                    {active && <circle r={26} fill="none" stroke={KIND_COLOR[n.kind]} strokeWidth={1} className="eco-pulse" />}
                    <circle r={active ? 11 : 8} fill={KIND_COLOR[n.kind]} />
                    <circle r={18} fill="transparent" />
                    <text
                      y={-22}
                      textAnchor="middle"
                      className="fill-[var(--milk)] font-sans"
                      style={{ fontSize: 15, fontWeight: active ? 700 : 500, letterSpacing: "0.01em" }}
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2" aria-label="Легенда">
              {(Object.keys(KIND_LABEL) as NodeKind[]).map((k) => (
                <li key={k} className="t-mono flex items-center gap-2 text-[var(--milk-60)]">
                  <span className="h-2 w-2 rounded-full" style={{ background: KIND_COLOR[k] }} />
                  {KIND_LABEL[k]}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2 md:hidden" aria-label="Узлы схемы">
              {nodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSel(n.id)}
                  aria-pressed={n.id === sel}
                  className={cn("t-small border px-3 py-1.5", n.id === sel ? "border-gold-300 text-milk" : "border-[var(--milk-15)]")}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={sel}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="border-t pt-6"
                style={{ borderColor: KIND_COLOR[node.kind] }}
              >
                <p className="t-mono" style={{ color: KIND_COLOR[node.kind] }}>
                  {KIND_LABEL[node.kind]}
                </p>
                <h3 className="t-h1 mt-3">{node.label}</h3>
                {node.latin && <p className="t-latin mt-1 text-[var(--milk-60)]">{node.latin}</p>}
                <p className="t-body mt-6">{node.role}</p>
                <ul className="mt-8 space-y-3">
                  {links.map((e) => {
                    const other = byId[e.from === sel ? e.to : e.from];
                    const out = e.from === sel;
                    return (
                      <li key={e.from + e.to}>
                        <button
                          type="button"
                          onClick={() => setSel(other.id)}
                          className="group flex w-full items-baseline gap-3 text-left"
                        >
                          <span className="t-mono w-5 text-[var(--milk-40)]">{out ? "→" : "←"}</span>
                          <span>
                            <span className="t-small block text-[var(--milk-60)]">{e.label}</span>
                            <span className="link-u text-milk">{other.label}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {node.animalSlug && (
                  <Link href={`/animals/${node.animalSlug}`} className="t-label link-u mt-8 inline-block text-gold-300">
                    Открыть досье вида →
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
