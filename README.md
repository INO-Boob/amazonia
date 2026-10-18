# AMAZONIA — The Living Rainforest

Иммерсивный образовательный сайт о животном мире Амазонии: кинематографичный
3D-лес на первом экране, девять глав-«экспедиций», каталог из 21 вида с
досье, интерактивная карта и полная библиография.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Публикация на GitHub Pages

1. Загрузите проект в репозиторий GitHub (ветка `main`).
2. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Готово — workflow `.github/workflows/deploy.yml` соберёт статическую версию
   (`GITHUB_PAGES=1`) и опубликует её по адресу `https://<логин>.github.io/<репозиторий>/`.
   Каждый следующий push в `main` обновляет сайт.

Локальная проверка статической сборки:
`GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/amazonia npm run build` → папка `out/`.

## Стек и зачем каждая зависимость

| Пакет | Задача |
| --- | --- |
| Next.js 16 (App Router, TS) | Статическая генерация страниц, `next/image` (AVIF/WebP, адаптивные размеры) |
| three + @react-three/fiber + drei | WebGL-сцены: лес, подводный мир, светлячки; drei — загрузка GLB, адаптация DPR |
| gsap (+ ScrollTrigger, SplitText) | Сюжетные scroll-сцены, кинетическая типографика |
| motion (Framer Motion) | Интерфейсные переходы: меню, фильтры, панели |
| lenis | Плавная прокрутка без scroll-jacking, синхронизирована с ScrollTrigger |
| maplibre-gl | Интерактивная векторная карта на локальных GeoJSON |
| zustand | Глобальные настройки: качество 3D, движение, звук |
| lucide-react | Иконки |
| @turf/* (dev) | Сборка геоданных карты (`npm run geo`) |

Основа архитектуры (центральный `lib/gsap.ts`, ленивые 3D-обёртки, пауза
рендера вне экрана) вдохновлена `giuucmp/aether-boilerplate`; код написан заново.

## Структура

```
app/                    страницы: /, /animals, /animals/[slug], /map, /sources
components/
  layout/               шапка, подвал, звук, настройки качества
  motion/               SplitHeading (GSAP SplitText), Reveal, SmoothScroll (Lenis)
  home/                 главы 0–9 главной страницы
  catalog/ animal/      каталог, бейджи и шкала IUCN
  map/                  карта MapLibre
  three/                SceneCanvas (общая обёртка), forest/, river/, night/
  ui/photo.tsx          фото с параллаксом, маской и атрибуцией
data/                   животные, фото (photos.json), зоны карты, экосистема,
                        источники, ряд PRODES, внешние ассеты
lib/                    gsap, настройки/уровни качества, хуки, утилиты
public/assets/          animals, environments, textures, models, audio, geo,
                        posters, video; manifest.json — происхождение всех файлов
scripts/                build-geo.mjs, build-manifest.mjs, copy-vendor.mjs
```

## Производительность и доступность

- Уровни качества: **высокое / стандартное / облегчённое / постеры**; авто-определение
  по GPU/ядрам/памяти/типу указателя, ручной выбор в меню настроек.
- three.js загружается отдельным чанком только на клиенте; пока сцена готовится,
  показан статичный постер (рендер самой сцены), затем — плавная смена.
- Рендер останавливается вне экрана и в скрытой вкладке; DPR снижается при падении FPS;
  ошибки WebGL и потеря контекста переводят сайт на постеры.
- `prefers-reduced-motion` и переключатель «Декоративное движение» отключают
  параллакс, 3D-сцены, частицы и Lenis.
- Звук выключен по умолчанию, запускается только по клику, есть громкость.
- Навигация с клавиатуры, видимые focus-состояния, ссылка «К содержанию».

## Данные и ресурсы

- **Фото** — 67 наблюдений iNaturalist Open Data (CC0 / CC BY / CC BY-SA / CC BY-NC /
  CC BY-NC-SA, без ND), отобранных вручную; координаты каждого кадра проверены на
  попадание в Амазонию/Гвианский щит. Автор и лицензия выводятся у каждого фото.
- **Звук** — полевые записи Freesound (CC0/CC BY) из набора ESC-50, микшируются
  генеративно в Web Audio.
- **3D** — лес процедурный (геометрия и текстуры листьев рисуются в браузере);
  птицы — `Parrot.glb` из примеров three.js (RO.ME, CC BY-NC-SA 3.0).
- **Карта** — Natural Earth (public domain); поймы — схематичные буферы.
- Полный список: страница `/sources` и `public/assets/manifest.json`.

Проект некоммерческий: часть фотографий и модель птицы распространяются под
лицензиями NC.
