"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SoundControl } from "./sound-control";
import { SettingsControl } from "./settings-control";

const NAV = [
  { href: "/", label: "Экспедиция", no: "I" },
  { href: "/animals", label: "Животные", no: "II" },
  { href: "/map", label: "Карта", no: "III" },
  { href: "/sources", label: "Источники", no: "IV" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // the menu is open only for the route it was opened on — navigating closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean | ((o: boolean) => boolean)) => {
    const next = typeof v === "function" ? v(open) : v;
    setOpenOn(next ? pathname : null);
  };

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-[background-color,backdrop-filter,border-color] duration-700",
          scrolled && !open ? "border-b border-[var(--milk-08)] bg-[rgb(7_18_12/0.72)] backdrop-blur-md" : "border-b border-transparent",
        )}
      >
        <div className="gutter flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" className="group flex items-baseline gap-3" aria-label="AMAZONIA — на главную">
            <span className="font-display text-[1.45rem] font-medium tracking-[0.32em] text-milk">AMAZONIA</span>
            <span className="t-mono hidden text-[var(--milk-40)] lg:inline">3.46°S 62.21°W</span>
          </Link>

          <nav aria-label="Основная навигация" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {NAV.map((n) => {
                const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "t-label group relative flex items-center gap-2 py-2 transition-colors",
                        active ? "text-gold-300" : "text-[var(--milk-80)] hover:text-milk",
                      )}
                    >
                      <span className="t-mono text-[0.6rem] text-[var(--milk-40)]">{n.no}</span>
                      {n.label}
                      <span
                        className={cn(
                          "absolute -bottom-0.5 left-0 h-px bg-current transition-all duration-500",
                          active ? "w-full" : "w-0 group-hover:w-full",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <SoundControl />
            <SettingsControl />
            <button
              type="button"
              className="ml-1 grid h-10 w-10 place-items-center text-milk md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={22} strokeWidth={1.4} /> : <Menu size={22} strokeWidth={1.4} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[95] flex flex-col justify-end bg-forest-950 px-[var(--gutter)] pb-10 pt-[calc(var(--header-h)+2rem)] md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav aria-label="Мобильная навигация">
              <ul className="flex flex-col gap-2">
                {NAV.map((n, i) => (
                  <motion.li
                    key={n.href}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={n.href} className="flex items-baseline gap-4 border-b border-[var(--milk-08)] py-4">
                      <span className="t-mono text-[var(--milk-40)]">{n.no}</span>
                      <span className="t-h1">{n.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <p className="t-mono mt-10 text-[var(--milk-40)]">Экспедиция · Бассейн Амазонки · 6–7 млн км²</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
