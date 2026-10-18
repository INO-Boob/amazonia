export interface Source {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  usedFor: string;
}

/** Bibliography — referenced by chapters via `id`. */
export const sources: Source[] = [
  {
    id: "spa-2021",
    title: "Amazon Assessment Report 2021",
    publisher: "Science Panel for the Amazon (SPA), UN SDSN",
    year: "2021",
    url: "https://www.theamazonwewant.org/amazon-assessment-report-2021/",
    usedFor: "Площадь лесов, доля обезлесенных (~17 %) и деградированных (≥17 %) территорий, риск переломной точки.",
  },
  {
    id: "flores-2024",
    title: "Critical transitions in the Amazon forest system",
    publisher: "Flores B. M. et al., Nature 626, 555–564",
    year: "2024",
    url: "https://doi.org/10.1038/s41586-023-06970-0",
    usedFor: "К 2050 году 10–47 % лесов Амазонии могут подвергнуться сочетанию нарушений, способных вызвать переход экосистемы в иное состояние.",
  },
  {
    id: "lovejoy-nobre-2018",
    title: "Amazon Tipping Point",
    publisher: "Lovejoy T. E., Nobre C., Science Advances 4(2)",
    year: "2018",
    url: "https://doi.org/10.1126/sciadv.aat2340",
    usedFor: "Гипотеза переломной точки при 20–25 % обезлесения.",
  },
  {
    id: "prodes-2025",
    title: "PRODES: оценка темпов обезлесения Легальной Амазонии, 08.2024–07.2025",
    publisher: "INPE (Национальный институт космических исследований Бразилии)",
    year: "2025",
    url: "https://www.gov.br/inpe/pt-br/assuntos/ultimas-noticias/20251015Nota_tcnica_EstimativaPRODES_2025.pdf",
    usedFor: "5 796 км² вырубки за сезон 2024/25 (−11 % к предыдущему году).",
  },
  {
    id: "prodes-series",
    title: "PRODES — Monitoramento do Desmatamento da Floresta Amazônica Brasileira por Satélite",
    publisher: "INPE / TerraBrasilis",
    year: "1988–2025",
    url: "https://terrabrasilis.dpi.inpe.br/app/dashboard/deforestation/biomes/legal_amazon/rates",
    usedFor: "Годовые темпы обезлесения для графика в главе «A Fragile Paradise».",
  },
  {
    id: "tefe-2023",
    title: "Гибель речных дельфинов в озере Тефе (сентябрь–октябрь 2023)",
    publisher: "Instituto de Desenvolvimento Sustentável Mamirauá; WWF-Brasil",
    year: "2023",
    url: "https://www.mamiraua.org.br/",
    usedFor: "Более 100 погибших бото и тукуши при температуре воды выше 39 °C во время засухи.",
  },
  {
    id: "manaus-2024",
    title: "Уровень Риу-Негру в порту Манауса, октябрь 2024",
    publisher: "Serviço Geológico do Brasil (SGB); Porto de Manaus",
    year: "2024",
    url: "https://www.sgb.gov.br/",
    usedFor: "Минимальный уровень реки за всю историю наблюдений с 1902 г.",
  },
  {
    id: "desantana-2019",
    title: "Unexpected species diversity in electric eels with a description of the strongest living bioelectricity generator",
    publisher: "de Santana C. D. et al., Nature Communications 10, 4000",
    year: "2019",
    url: "https://doi.org/10.1038/s41467-019-11690-z",
    usedFor: "Три вида электрических угрей, разряд 860 В у E. voltai.",
  },
  {
    id: "bastos-2021",
    title: "Social predation in electric eels",
    publisher: "Bastos D. A. et al., Ecology and Evolution 11(3)",
    year: "2021",
    url: "https://doi.org/10.1002/ece3.7121",
    usedFor: "Групповая охота E. voltai на реке Ирири.",
  },
  {
    id: "campos-silva-2016",
    title: "Community-based management induces rapid recovery of a high-value tropical freshwater fishery",
    publisher: "Campos-Silva J. V., Peres C. A., Scientific Reports 6, 34745",
    year: "2016",
    url: "https://doi.org/10.1038/srep34745",
    usedFor: "Восстановление арапаимы в озёрах под общинной охраной (река Журуа).",
  },
  {
    id: "rivas-2024",
    title: "Phylogeography and taxonomic revision of the green anaconda (Eunectes murinus)",
    publisher: "Rivas J. A. et al., Diversity 16(2), 127",
    year: "2024",
    url: "https://doi.org/10.3390/d16020127",
    usedFor: "Предложение о выделении северной зелёной анаконды (E. akayima).",
  },
  {
    id: "sioli",
    title: "The Amazon: Limnology and landscape ecology of a mighty tropical river and its basin",
    publisher: "Sioli H. (ed.), Dr W. Junk Publishers",
    year: "1984",
    url: "https://doi.org/10.1007/978-94-009-6542-3",
    usedFor: "Классификация рек на белые, чёрные и чистые воды.",
  },
  {
    id: "iucn",
    title: "The IUCN Red List of Threatened Species",
    publisher: "International Union for Conservation of Nature",
    year: "2024–2026",
    url: "https://www.iucnredlist.org/",
    usedFor: "Природоохранные категории видов. Категории сверены 18.10.2026; актуальную оценку уточняйте на сайте IUCN.",
  },
  {
    id: "birdlife",
    title: "BirdLife International Data Zone",
    publisher: "BirdLife International",
    year: "2024",
    url: "https://datazone.birdlife.org/",
    usedFor: "Статусы птиц (оценщик IUCN для птиц).",
  },
  {
    id: "natural-earth",
    title: "Natural Earth — physical regions, rivers, lakes, admin-0",
    publisher: "Natural Earth (public domain)",
    year: "v5",
    url: "https://www.naturalearthdata.com/",
    usedFor: "Геооснова интерактивной карты.",
  },
  {
    id: "inaturalist",
    title: "iNaturalist Open Data",
    publisher: "iNaturalist / California Academy of Sciences & National Geographic Society",
    year: "2022",
    url: "https://github.com/inaturalist/inaturalist-open-data",
    usedFor: "Все фотографии животных и ландшафтов (лицензии CC0 / CC BY / CC BY-SA / CC BY-NC / CC BY-NC-SA).",
  },
  {
    id: "ter-steege-2013",
    title: "Hyperdominance in the Amazonian tree flora",
    publisher: "ter Steege H. et al., Science 342, 1243092",
    year: "2013",
    url: "https://doi.org/10.1126/science.1243092",
    usedFor: "Оценка: ~16 000 видов деревьев и ~390 млрд деревьев в Амазонии.",
  },
  {
    id: "jezequel-2020",
    title: "A database of freshwater fish species of the Amazon Basin",
    publisher: "Jézéquel C. et al., Scientific Data 7, 96",
    year: "2020",
    url: "https://doi.org/10.1038/s41597-020-0436-4",
    usedFor: "2 406 валидных видов пресноводных рыб в бассейне Амазонки.",
  },
];

export const organizations = [
  { name: "Instituto Mamirauá", url: "https://www.mamiraua.org.br/", note: "Исследования и общинная охрана варзеа" },
  { name: "Science Panel for the Amazon", url: "https://www.theamazonwewant.org/", note: "Научная оценка состояния Амазонии" },
  { name: "Amazon Conservation (ACA)", url: "https://www.amazonconservation.org/", note: "Мониторинг вырубок MAAP, охрана в Перу и Боливии" },
  { name: "RAISG", url: "https://www.raisg.org/", note: "Сеть геоданных о лесах и территориях коренных народов" },
  { name: "WWF — Amazon", url: "https://www.worldwildlife.org/places/amazon", note: "Программы по пресноводным видам и охраняемым территориям" },
  { name: "IUCN Red List", url: "https://www.iucnredlist.org/", note: "Глобальные оценки природоохранного статуса" },
] as const;

export function source(id: string) {
  const s = sources.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown source ${id}`);
  return s;
}

