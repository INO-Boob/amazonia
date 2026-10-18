import type { Metadata } from "next";
import { MapLoader } from "@/components/map/map-loader";

export const metadata: Metadata = {
  title: "Карта Амазонии",
  description: "Интерактивная карта бассейна Амазонки: реки белых, чёрных и чистых вод, поймы, Гвианский щит, предгорья Анд и обитающие там виды.",
};

export default function MapPage() {
  return (
    <div className="bg-forest-950 pt-[var(--header-h)]">
      <MapLoader />
    </div>
  );
}
