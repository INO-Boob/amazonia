/**
 * A simplified, literature-based interaction network for chapter 7.
 * Every edge is a documented relationship (predation, seed dispersal,
 * pollination, nutrient flow, climate feedback) — not an exhaustive food web.
 */
export type NodeKind = "abiotic" | "plant" | "herbivore" | "disperser" | "predator" | "decomposer";

export interface EcoNode {
  id: string;
  label: string;
  latin?: string;
  kind: NodeKind;
  /** Position on a 1000×640 canvas. */
  x: number;
  y: number;
  role: string;
  animalSlug?: string;
}

export interface EcoEdge {
  from: string;
  to: string;
  label: string;
}

export const KIND_LABEL: Record<NodeKind, string> = {
  abiotic: "Вода и климат",
  plant: "Растения",
  herbivore: "Травоядные",
  disperser: "Распространители семян",
  predator: "Хищники",
  decomposer: "Почва и разложение",
};

export const nodes: EcoNode[] = [
  { id: "rain", label: "Дождь и «летающие реки»", kind: "abiotic", x: 500, y: 60, role: "Деревья испаряют огромные объёмы воды; влажный воздух переносится вглубь континента и снова выпадает дождём. Значительная часть осадков Амазонии — переработанная самим лесом влага." },
  { id: "flood", label: "Сезонный паводок", kind: "abiotic", x: 840, y: 150, role: "Уровень рек ежегодно меняется на 10 и более метров. Паводок соединяет лес и реку: рыбы уходят в затопленный лес, а ил удобряет поймы варзеа." },
  { id: "trees", label: "Гигантские деревья", latin: "Ceiba, Bertholletia", kind: "plant", x: 330, y: 200, role: "Эмерджентные деревья поднимаются над пологом на 50 м и более. Они дают плоды и семена, служат опорой для лиан и эпифитов и местом гнездования гарпии." },
  { id: "fruit", label: "Плоды и семена", kind: "plant", x: 560, y: 250, role: "Большинство деревьев влажного тропического леса распространяют семена с помощью животных. Без них крупносемянные виды не могут расселяться." },
  { id: "leaves", label: "Листва", latin: "Cecropia и др.", kind: "plant", x: 170, y: 330, role: "Листья — основа питания ленивцев, гоацинов и муравьёв-листорезов; цекропии растут быстро и первыми занимают просветы." },
  { id: "sloth", label: "Ленивец", kind: "herbivore", x: 150, y: 470, role: "Поедает листья и медленно перерабатывает их; основной объект охоты гарпии.", animalSlug: "sloth" },
  { id: "ants", label: "Муравьи-листорезы", kind: "herbivore", x: 330, y: 400, role: "Перерабатывают огромную массу листьев в грибные сады и перемешивают почву.", animalSlug: "leafcutter-ant" },
  { id: "monkeys", label: "Коаты", kind: "disperser", x: 470, y: 400, role: "Глотают плоды целиком и распространяют семена на большие расстояния.", animalSlug: "spider-monkey" },
  { id: "birds", label: "Туканы и ара", kind: "disperser", x: 640, y: 390, role: "Туканы разносят семена, ара — и поедают, и переносят их. Обе группы зависят от старых деревьев с дуплами.", animalSlug: "toucan" },
  { id: "fish", label: "Рыбы затопленного леса", latin: "напр. тамбаки", kind: "disperser", x: 800, y: 300, role: "В половодье многие рыбы питаются упавшими плодами и разносят семена по затопленному лесу — уникальная амазонская связь." },
  { id: "capybara", label: "Капибара", kind: "herbivore", x: 880, y: 450, role: "Пасётся на пойменных лугах; важная добыча крупных хищников.", animalSlug: "capybara" },
  { id: "harpy", label: "Гарпия", kind: "predator", x: 250, y: 580, role: "Высший хищник полога: охотится на ленивцев и обезьян.", animalSlug: "harpy-eagle" },
  { id: "jaguar", label: "Ягуар", kind: "predator", x: 600, y: 580, role: "Высший хищник суши и прибрежья: капибары, пекари, кайманы, черепахи.", animalSlug: "jaguar" },
  { id: "boto", label: "Бото и выдры", kind: "predator", x: 860, y: 590, role: "Главные хищники рек; зависят от рыбных запасов и сезонного паводка.", animalSlug: "boto" },
  { id: "caiman", label: "Чёрный кайман", kind: "predator", x: 740, y: 500, role: "Ночной хищник пойм; добыча и конкурент ягуара.", animalSlug: "black-caiman" },
  { id: "soil", label: "Почва и грибы", kind: "decomposer", x: 420, y: 520, role: "Почвы Амазонии в основном бедные: питательные вещества быстро возвращаются в растения через опад, грибы и микоризу." },
];

export const edges: EcoEdge[] = [
  { from: "rain", to: "trees", label: "Осадки питают лес" },
  { from: "trees", to: "rain", label: "Транспирация возвращает влагу в атмосферу" },
  { from: "rain", to: "flood", label: "Сезонные дожди поднимают реки" },
  { from: "flood", to: "fish", label: "Половодье открывает рыбам затопленный лес" },
  { from: "trees", to: "fruit", label: "Плодоношение" },
  { from: "trees", to: "leaves", label: "Листва и опад" },
  { from: "leaves", to: "sloth", label: "Питание листьями" },
  { from: "leaves", to: "ants", label: "Срезание листьев для грибных садов" },
  { from: "fruit", to: "monkeys", label: "Питание плодами" },
  { from: "fruit", to: "birds", label: "Питание плодами" },
  { from: "fruit", to: "fish", label: "Плоды падают в воду" },
  { from: "monkeys", to: "trees", label: "Распространение семян" },
  { from: "birds", to: "trees", label: "Распространение семян" },
  { from: "fish", to: "trees", label: "Распространение семян в половодье" },
  { from: "sloth", to: "harpy", label: "Добыча" },
  { from: "monkeys", to: "harpy", label: "Добыча" },
  { from: "capybara", to: "jaguar", label: "Добыча" },
  { from: "caiman", to: "jaguar", label: "Добыча" },
  { from: "fish", to: "boto", label: "Добыча" },
  { from: "fish", to: "caiman", label: "Добыча" },
  { from: "flood", to: "capybara", label: "Пойменные луга" },
  { from: "ants", to: "soil", label: "Перемешивание и удобрение почвы" },
  { from: "sloth", to: "soil", label: "Помёт у основания деревьев" },
  { from: "soil", to: "trees", label: "Возврат питательных веществ" },
];
