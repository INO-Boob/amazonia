import type { Metadata } from "next";
import { Catalog } from "@/components/catalog/catalog";
import { animals } from "@/data/animals";
import { plural } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Животные Амазонии — каталог",
  description: "Досье 21 вида Амазонии: ареал, среда обитания, рацион, поведение, роль в экосистеме и природоохранный статус IUCN.",
};

export default function AnimalsPage() {
  return (
    <div className="bg-forest-950 pt-[calc(var(--header-h)+6vh)]">
      <header className="gutter grid gap-10 pb-12 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="t-mono text-gold-300">II — Animals</p>
          <h1 className="t-mega mt-6">Бестиарий экспедиции</h1>
        </div>
        <div className="flex flex-col justify-end md:col-span-4">
          <p className="t-body">
            {animals.length} {plural(animals.length, "вид", "вида", "видов")} Амазонии — от ягуара и розового дельфина до муравьёв-листорезов. Для
            каждого — реальная фотография, ареал, рацион и природоохранный статус с источником.
          </p>
          <p className="t-mono mt-4 text-[var(--milk-40)]">Ареалы указаны точно: многие виды живут лишь в части бассейна.</p>
        </div>
      </header>
      <Catalog />
    </div>
  );
}
