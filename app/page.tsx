import { Hero } from "@/components/home/hero";
import { GreenOcean } from "@/components/home/green-ocean";
import { Canopy } from "@/components/home/canopy";
import { Jaguar } from "@/components/home/jaguar";
import { Beneath } from "@/components/home/beneath";
import { SmallWorlds } from "@/components/home/small-worlds";
import { Nightfall } from "@/components/home/nightfall";
import { Ecosystem } from "@/components/home/ecosystem";
import { Fragile } from "@/components/home/fragile";
import { Expedition } from "@/components/home/expedition";
import { DayZone } from "@/components/home/day-zone";

export default function Home() {
  return (
    <>
      <Hero />
      <DayZone>
        <GreenOcean />
        <Canopy />
        <Jaguar />
      </DayZone>
      <Beneath />
      <DayZone>
        <SmallWorlds />
      </DayZone>
      <Nightfall />
      <DayZone>
        <Ecosystem />
        <Fragile />
        <Expedition />
      </DayZone>
    </>
  );
}
