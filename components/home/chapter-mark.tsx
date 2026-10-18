import { cn } from "@/lib/utils";

/** Chapter label: number · english art-title · russian descriptor. */
export function ChapterMark({ no, en, ru, className, tone = "gold" }: { no: string; en: string; ru: string; className?: string; tone?: "gold" | "river" | "rust" | "moon" }) {
  const color = { gold: "text-gold-300", river: "text-river-300", rust: "text-rust-400", moon: "text-[#c9d3e0]" }[tone];
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className={cn("t-mono", color)}>{no}</span>
      <span className="h-px w-10 bg-[var(--milk-40)]" aria-hidden />
      <span className="t-label text-[var(--milk-80)]">{en}</span>
      <span className="t-mono hidden text-[var(--milk-40)] sm:inline">/ {ru}</span>
    </div>
  );
}
