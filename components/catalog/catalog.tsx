"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import {
  ACTIVITY_LABEL,
  animals,
  GROUP_LABEL,
  HABITAT_LABEL,
  type Activity,
  type Animal,
  type Group,
  type Habitat,
} from "@/data/animals";
import { photo } from "@/data/photos";
import { IucnBadge } from "@/components/animal/iucn-badge";
import { cn } from "@/lib/utils";

type Facet = "group" | "habitat" | "activity";
type State = { q: string; group: Group[]; habitat: Habitat[]; activity: Activity[] };

const EMPTY: State = { q: "", group: [], habitat: [], activity: [] };

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е");

function matches(a: Animal, s: State) {
  if (s.group.length && !s.group.includes(a.group)) return false;
  if (s.habitat.length && !a.habitats.some((h) => s.habitat.includes(h))) return false;
  if (s.activity.length && !s.activity.includes(a.activity)) return false;
  if (s.q) {
    const q = norm(s.q.trim());
    const hay = norm(`${a.nameRu} ${a.nameEn} ${a.scientific} ${a.tagline}`);
    if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

function readUrl(): State {
  const p = new URLSearchParams(window.location.search);
  const list = <T extends string>(k: string, allowed: Record<T, string>) =>
    (p.get(k)?.split(",").filter((v) => v in allowed) ?? []) as T[];
  return { q: p.get("q") ?? "", group: list("group", GROUP_LABEL), habitat: list("habitat", HABITAT_LABEL), activity: list("activity", ACTIVITY_LABEL) };
}

function writeUrl(s: State) {
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  (["group", "habitat", "activity"] as Facet[]).forEach((k) => s[k].length && p.set(k, s[k].join(",")));
  const qs = p.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

function FacetRow<T extends string>({ title, labels, value, onToggle, counts }: { title: string; labels: Record<T, string>; value: T[]; onToggle: (v: T) => void; counts: Record<string, number> }) {
  return (
    <fieldset className="grid gap-3 md:grid-cols-[9rem_1fr] md:items-baseline">
      <legend className="t-mono float-left mb-3 text-[var(--milk-40)] md:mb-0">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(labels) as T[]).map((k) => {
          const on = value.includes(k);
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(k)}
              className={cn(
                "t-small inline-flex items-center gap-2 border px-3.5 py-1.5 transition-colors duration-300",
                on ? "border-gold-300 bg-gold-300 text-forest-950" : "border-[var(--milk-15)] text-[var(--milk-80)] hover:border-[var(--milk-40)]",
              )}
            >
              {labels[k]}
              <span className={cn("t-mono text-[0.62rem]", on ? "text-forest-900" : "text-[var(--milk-40)]")}>{counts[k] ?? 0}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Catalog() {
  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Sync from the URL once after hydration (the page itself is prerendered without query params).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readUrl());
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) writeUrl(state);
  }, [state, ready]);

  const results = useMemo(() => animals.filter((a) => matches(a, state)), [state]);

  // facet counts given the *other* active filters
  const counts = useMemo(() => {
    const c = (facet: Facet) => {
      const base = { ...state, [facet]: [] } as State;
      const out: Record<string, number> = {};
      animals.filter((a) => matches(a, base)).forEach((a) => {
        const vals = facet === "habitat" ? a.habitats : [a[facet]];
        vals.forEach((v) => (out[v] = (out[v] ?? 0) + 1));
      });
      return out;
    };
    return { group: c("group"), habitat: c("habitat"), activity: c("activity") };
  }, [state]);

  const toggle = <K extends Facet>(k: K, v: State[K][number]) =>
    setState((s) => {
      const arr = s[k] as string[];
      return { ...s, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] };
    });

  const active = state.q || state.group.length || state.habitat.length || state.activity.length;

  return (
    <div>
      <div className="gutter sticky top-[var(--header-h)] z-30 border-b border-[var(--milk-08)] bg-[rgb(7_18_12/0.92)] py-5 backdrop-blur-md">
        <label className="relative flex items-center">
          <span className="sr-only">Поиск по названию</span>
          <Search size={18} strokeWidth={1.4} className="pointer-events-none absolute left-0 text-[var(--milk-40)]" />
          <input
            type="search"
            value={state.q}
            onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
            placeholder="Ягуар, Inia, harpy…"
            className="t-h3 w-full border-b border-[var(--milk-15)] bg-transparent py-2 pl-8 pr-10 text-milk placeholder:text-[var(--milk-40)] focus:border-gold-300 focus:outline-none"
          />
          {state.q && (
            <button type="button" onClick={() => setState((s) => ({ ...s, q: "" }))} className="absolute right-0 p-2 text-[var(--milk-60)] hover:text-milk" aria-label="Очистить поиск">
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      <div className="gutter mt-10 space-y-5">
        <FacetRow title="Группа" labels={GROUP_LABEL} value={state.group} onToggle={(v) => toggle("group", v)} counts={counts.group} />
        <FacetRow title="Среда" labels={HABITAT_LABEL} value={state.habitat} onToggle={(v) => toggle("habitat", v)} counts={counts.habitat} />
        <FacetRow title="Образ жизни" labels={ACTIVITY_LABEL} value={state.activity} onToggle={(v) => toggle("activity", v)} counts={counts.activity} />
        <div className="flex items-center justify-between border-t border-[var(--milk-08)] pt-5">
          <p className="t-mono text-[var(--milk-60)]" aria-live="polite">
            Найдено: <span className="text-milk">{results.length}</span> из {animals.length}
          </p>
          {active ? (
            <button type="button" onClick={() => setState(EMPTY)} className="t-label link-u text-gold-300">
              Сбросить фильтры
            </button>
          ) : null}
        </div>
      </div>

      <ul className="gutter mt-12 grid grid-cols-1 gap-x-6 gap-y-16 pb-[var(--section-y)] sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {results.map((a, i) => {
            const p = photo(a.photo);
            const wide = i % 7 === 0;
            return (
              <motion.li
                key={a.slug}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(wide && "sm:col-span-2", i % 7 === 3 && "lg:mt-20")}
              >
                <Link href={`/animals/${a.slug}`} className="group block">
                  <div className={cn("relative overflow-hidden", wide ? "aspect-[16/10]" : "aspect-[4/5]")}>
                    <Image
                      src={p.src}
                      alt={`${a.nameRu} (${a.scientific})`}
                      fill
                      sizes={wide ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"}
                      placeholder="blur"
                      blurDataURL={p.blur}
                      className="object-cover transition-[transform,filter] duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.06] group-hover:brightness-110"
                    />
                    <span className="t-mono absolute left-3 top-3 bg-[rgb(5_12_8/0.6)] px-2 py-1 text-milk">№ {a.index}</span>
                    <span className="absolute right-3 top-3">
                      <IucnBadge code={a.status.code} compact />
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h2 className="t-h3 transition-colors group-hover:text-gold-300">{a.nameRu}</h2>
                    <span className="t-mono shrink-0 text-[var(--milk-40)]">{GROUP_LABEL[a.group]}</span>
                  </div>
                  <p className="t-latin text-[var(--milk-60)]">{a.scientific}</p>
                  <p className="t-small mt-2 line-clamp-2">{a.tagline}</p>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {!results.length && (
          <li className="col-span-full py-20 text-center">
            <p className="t-h2">Никого не нашли</p>
            <p className="t-small mt-3">Попробуйте другое название или ослабьте фильтры.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
