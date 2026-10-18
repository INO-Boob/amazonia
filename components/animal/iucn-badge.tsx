import { IUCN_LABEL, type IucnCode } from "@/data/animals";
import { cn } from "@/lib/utils";

const SCALE: IucnCode[] = ["LC", "NT", "VU", "EN", "CR"];
const COLOR: Record<IucnCode, string> = {
  LC: "#86a067",
  NT: "#b8b260",
  VU: "#cfa45a",
  EN: "#c46a45",
  CR: "#b0403a",
  DD: "#8b8b80",
  NE: "#6d6d66",
  "LR/cd": "#9aa58a",
};

export function IucnBadge({ code, compact }: { code: IucnCode; compact?: boolean }) {
  return (
    <span
      className={cn("t-mono inline-flex items-center gap-2 bg-[rgb(5_12_8/0.7)] text-milk", compact ? "px-2 py-1" : "px-3 py-1.5")}
      title={`IUCN: ${IUCN_LABEL[code]}`}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: COLOR[code] }} aria-hidden />
      {code}
      {!compact && <span className="text-[var(--milk-60)]">· {IUCN_LABEL[code]}</span>}
      {compact && <span className="sr-only">{IUCN_LABEL[code]}</span>}
    </span>
  );
}

/** Horizontal scale LC → CR with the species' position marked. */
export function IucnScale({ code }: { code: IucnCode }) {
  const idx = SCALE.indexOf(code);
  return (
    <div>
      <ol className="grid grid-cols-5 gap-1" aria-label="Шкала категорий IUCN">
        {SCALE.map((c, i) => (
          <li key={c} className="flex flex-col gap-2">
            <span className="h-1.5" style={{ background: i === idx ? COLOR[c] : "rgb(239 232 216 / 0.12)" }} />
            <span className={cn("t-mono", i === idx ? "text-milk" : "text-[var(--milk-40)]")}>{c}</span>
          </li>
        ))}
      </ol>
      {idx === -1 && (
        <p className="t-mono mt-3 text-[var(--milk-60)]">
          {code} — {IUCN_LABEL[code]}: вне основной шкалы угроз
        </p>
      )}
    </div>
  );
}
