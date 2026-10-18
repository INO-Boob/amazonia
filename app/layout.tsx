import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono, Manrope } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SettingsBoot } from "@/components/layout/settings-boot";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SoundEngine } from "@/components/layout/sound-engine";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "AMAZONIA — The Living Rainforest",
    template: "%s · AMAZONIA",
  },
  description:
    "Иммерсивная экспедиция в мир Амазонии: полог леса, реки, ночь и самые удивительные обитатели крупнейшего тропического леса планеты.",
  openGraph: {
    title: "AMAZONIA — The Living Rainforest",
    description: "Иммерсивная экспедиция в мир Амазонии.",
    images: ["/assets/environments/euterpe-2.jpg"],
    locale: "ru_RU",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07120c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${manrope.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          // Decide motion mode before first paint so kinetic headlines don't flash.
          dangerouslySetInnerHTML={{
            __html: `try{var m=localStorage.getItem("amz-motion");var r=matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.dataset.motion=m?m:(r?"off":"on")}catch(e){document.documentElement.dataset.motion="on"}`,
          }}
        />
        <noscript>
          <style>{`.split-pending{visibility:visible!important}.hero-fade,.hero-ui,#hero-title{opacity:1!important}.hero-curtain{display:none}`}</style>
        </noscript>
      </head>
      <body className="grain min-h-screen antialiased">
        <a
          href="#main"
          className="t-label fixed left-4 top-4 z-[200] -translate-y-24 bg-gold-300 px-4 py-3 text-forest-950 transition-transform focus:translate-y-0"
        >
          К содержанию
        </a>
        <SettingsBoot />
        <SmoothScroll />
        <SoundEngine />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
