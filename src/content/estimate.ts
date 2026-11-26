import type { RoomSlug } from "./site";

export type Value = number | string | string[];
export type Draft = Record<string, Value>;
export type Option = { id: string; label: string };
type FieldBase = { id: string; label: string; when?: (draft: Draft) => boolean };
export type NumberField = FieldBase & { kind: "size" | "count"; min: number; max: number; initial: number };
type ChoiceField = FieldBase & { kind: "choice"; options: readonly Option[]; initial: string; compact?: boolean };
type MultiField = FieldBase & { kind: "multi"; options: readonly Option[]; initial: string[]; compact?: boolean };
type TextField = FieldBase & { kind: "text"; initial: string; placeholder: string };
export type Field = NumberField | ChoiceField | MultiField | TextField;
export type EstimateConfig = {
  type: string;
  parameters: string;
  description: string;
  view: string;
  mainSize: string;
  planLabel: (draft: Draft) => string;
  steps: { title: string; fields: Field[] }[];
};

export const formatNumber = new Intl.NumberFormat("ru-RU");
export const formatMm = (value: number) => `${formatNumber.format(value)} мм`;
export const readNumber = (draft: Draft, id: string) => draft[id] as number;
export const readChoice = (draft: Draft, id: string) => draft[id] as string;
export const readList = (draft: Draft, id: string) => draft[id] as string[];
export const hasItem = (draft: Draft, id: string, value: string) => readList(draft, id).includes(value);
const option = (id: string, label: string): Option => ({ id, label });
const options = (labels: string[]): Option[] => labels.map((label) => option(label, label));
const decideLater = (labels: string[]) => [option("", "Ещё выбираю"), ...options(labels)];
const choice = (id: string, label: string, entries: readonly Option[], initial = entries[0].id, compact = false): ChoiceField =>
  ({ id, label, kind: "choice", options: entries, initial, compact });
const size = (id: string, label: string, min: number, max: number, initial: number): NumberField =>
  ({ id, label, kind: "size", min, max, initial });
const count = (id: string, label: string, min: number, max: number, initial: number): NumberField =>
  ({ id, label, kind: "count", min, max, initial });
const multi = (id: string, label: string, entries: readonly Option[], initial: string[] = [], compact = false): MultiField =>
  ({ id, label, kind: "multi", options: entries, initial, compact });
const notes = (placeholder: string): TextField => ({ id: "notes", label: "Что ещё важно", kind: "text", initial: "", placeholder });
const labelFor = (entries: readonly Option[], id: string) => entries.find((entry) => entry.id === id)?.label ?? "";

export const layoutOptions = [option("straight", "Прямая"), option("corner", "Угловая"), option("u-shape", "П-образная")];
const shape = choice("configuration", "Конфигурация", layoutOptions, "straight", true);
const side = {
  ...choice("corner-side", "Расположение крыла", [option("left", "Слева"), option("right", "Справа")]),
  when: (draft: Draft) => readChoice(draft, "configuration") === "corner",
};
export function planHasSide(draft: Draft, direction: "left" | "right") {
  return readChoice(draft, "configuration") === "u-shape"
    || (readChoice(draft, "configuration") === "corner" && readChoice(draft, "corner-side") === direction);
}

const fronts = () => choice("fronts", "Фасады", decideLater(["Матовые", "С фактурой дерева", "Глянцевые"]));
const cabinetTypes = [option("built-in", "Встроенный"), option("freestanding", "Отдельно стоящий")];
const hallwayTypes = [option("open", "Открытая"), option("closed", "Закрытая")];
const childrenTypes = [option("wardrobe", "Шкаф"), option("desk", "Письменный стол"), option("storage", "Система хранения"), option("combined", "Комплексное решение")];

const kitchens: EstimateConfig = {
  type: "Кухня",
  parameters: "Параметры кухни",
  description: "Соберите параметры кухни для индивидуального расчёта. Стоимость уточнит менеджер.",
  view: "План сверху",
  mainSize: "Основная стена",
  planLabel: (draft) => labelFor(layoutOptions, readChoice(draft, "configuration")),
  steps: [
    { title: "Конфигурация", fields: [{ ...shape, label: "Конфигурация кухни" }, side] },
    { title: "Размеры", fields: [
      size("width", "Основная стена", 1200, 6500, 2640),
      { ...size("left", "Левое крыло", 600, 4800, 1800), when: (draft) => planHasSide(draft, "left") },
      { ...size("right", "Правое крыло", 600, 4800, 1800), when: (draft) => planHasSide(draft, "right") },
      size("height", "Высота до потолка", 2000, 3800, 2400),
    ] },
    { title: "Отделка", fields: [fronts(), choice("worktop", "Столешница", decideLater(["Ламинат", "Искусственный камень", "Дерево"]))] },
    { title: "Пожелания", fields: [
      multi("extras", "Особенности кухни", options(["Встроенная техника", "Высокие пеналы", "Выдвижные ящики", "Подсветка"]), [], true),
      notes("Например, оставить место для отдельного холодильника"),
    ] },
  ],
};

const wardrobes: EstimateConfig = {
  type: "Шкаф",
  parameters: "Параметры шкафа",
  description: "Укажите размеры шкафа, двери и наполнение. Стоимость уточнит менеджер.",
  view: "Вид спереди",
  mainSize: "Ширина шкафа",
  planLabel: (draft) => labelFor(cabinetTypes, readChoice(draft, "type")),
  steps: [
    { title: "Тип шкафа", fields: [
      choice("type", "Установка", cabinetTypes),
      choice("doors", "Двери", [option("hinged", "Распашные"), option("sliding", "Купе")]),
    ] },
    { title: "Размеры", fields: [
      size("width", "Ширина", 400, 6000, 2200), size("height", "Высота", 1000, 4000, 2400), size("depth", "Глубина", 250, 1000, 600),
      count("sections", "Количество секций", 1, 8, 3),
    ] },
    { title: "Материал фасадов", fields: [choice("fronts", "Материал фасадов", decideLater(["ЛДСП", "МДФ", "Зеркало", "Стекло"]))] },
    { title: "Внутреннее наполнение", fields: [
      multi("extras", "Наполнение", [option("shelves", "Полки"), option("rail", "Штанга"), option("drawers", "Выдвижные ящики"), option("long", "Отсек для длинной одежды")], ["shelves", "rail"]),
      notes("Например, предусмотреть место для пылесоса"),
    ] },
  ],
};

const dressingRooms: EstimateConfig = {
  type: "Гардеробная",
  parameters: "Параметры гардеробной",
  description: "Укажите размеры помещения и наполнение гардеробной. Стоимость уточнит менеджер.",
  view: "План сверху",
  mainSize: "Ширина помещения",
  planLabel: (draft) => labelFor(layoutOptions, readChoice(draft, "configuration")),
  steps: [
    { title: "Конфигурация", fields: [shape, side] },
    { title: "Размеры помещения", fields: [
      size("width", "Ширина помещения", 900, 6000, 2400), size("depth", "Глубина помещения", 900, 5500, 1800), size("height", "Высота до потолка", 1800, 4000, 2500),
    ] },
    { title: "Полки, штанги и ящики", fields: [
      count("shelves", "Полки", 0, 12, 4), count("rails", "Штанги", 0, 6, 1), count("drawers", "Выдвижные ящики", 0, 8, 2),
    ] },
    { title: "Дополнительное наполнение", fields: [
      multi("extras", "Дополнительное наполнение", [option("mirror", "Зеркало"), option("light", "Подсветка"), option("baskets", "Выдвижные корзины"), option("shoes", "Полки для обуви")], [], true),
      notes("Например, выделить место для чемоданов"),
    ] },
  ],
};

const hallways: EstimateConfig = {
  type: "Мебель для прихожей",
  parameters: "Параметры прихожей",
  description: "Соберите систему хранения по размерам прихожей. Стоимость уточнит менеджер.",
  view: "Вид спереди",
  mainSize: "Ширина пространства",
  planLabel: (draft) => `${labelFor(hallwayTypes, readChoice(draft, "type"))} система`,
  steps: [
    { title: "Система хранения", fields: [choice("type", "Система хранения", hallwayTypes)] },
    { title: "Размеры пространства", fields: [
      size("width", "Ширина", 600, 5000, 2000), size("height", "Высота", 1600, 3800, 2400), size("depth", "Глубина", 200, 900, 450),
    ] },
    { title: "Элементы прихожей", fields: [
      multi("extras", "Элементы прихожей", [option("wardrobe", "Шкаф"), option("shoe-rack", "Обувница"), option("mirror", "Зеркало"), option("seat", "Сиденье")], ["wardrobe", "shoe-rack", "mirror"], true),
    ] },
    { title: "Материалы и пожелания", fields: [
      choice("fronts", "Материал фасадов", decideLater(["ЛДСП", "МДФ", "Зеркало"])),
      notes("Например, оставить свободным проход рядом с дверью"),
    ] },
  ],
};

const children: EstimateConfig = {
  type: "Детская мебель",
  parameters: "Параметры детской мебели",
  description: "Выберите мебель и укажите размеры для индивидуального расчёта. Стоимость уточнит менеджер.",
  view: "Вид спереди",
  mainSize: "Ширина мебели",
  planLabel: (draft) => labelFor(childrenTypes, readChoice(draft, "type")),
  steps: [
    { title: "Тип мебели", fields: [choice("type", "Тип мебели", childrenTypes, "combined", true)] },
    { title: "Размеры и секции", fields: [
      size("width", "Ширина", 500, 4200, 2000), size("height", "Высота", 500, 3200, 1800), size("depth", "Глубина", 250, 1000, 550),
      count("sections", "Количество секций", 1, 8, 3),
    ] },
    { title: "Материалы", fields: [choice("fronts", "Предпочтительный материал", decideLater(["ЛДСП", "МДФ", "Массив дерева"]))] },
    { title: "Пожелания", fields: [
      multi("extras", "Наполнение", [option("drawers", "Выдвижные ящики"), option("hooks", "Крючок для рюкзака"), option("shelves", "Полки для книг")], ["drawers"]),
      notes("Например, оставить проход к окну"),
    ] },
  ],
};

export const estimates: Record<RoomSlug, EstimateConfig> = { kitchens, wardrobes, "dressing-rooms": dressingRooms, hallways, children };

export function initialDraft(config: EstimateConfig): Draft {
  return Object.fromEntries(config.steps.flatMap(({ fields }) => fields.map((field) => [field.id, field.initial])));
}

export function estimateSummary(config: EstimateConfig, draft: Draft) {
  const lines = [`Тип мебели: ${config.type.toLowerCase()}.`];
  for (const { fields } of config.steps) {
    for (const field of fields) {
      if (field.when && !field.when(draft)) continue;
      const { id, label, kind } = field;
      if (kind === "size") lines.push(`${label}: ${formatMm(readNumber(draft, id))}.`);
      if (kind === "count") lines.push(`${label}: ${readNumber(draft, id)}.`);
      if (kind === "choice" && readChoice(draft, id)) lines.push(`${label}: ${labelFor(field.options, readChoice(draft, id)).toLowerCase()}.`);
      if (kind === "multi" && readList(draft, id).length) {
        lines.push(`${label}: ${readList(draft, id).map((item) => labelFor(field.options, item).toLowerCase()).join(", ")}.`);
      }
      if (kind === "text" && readChoice(draft, id).trim()) lines.push(`Примечание: ${readChoice(draft, id).trim()}`);
    }
  }
  return lines.join("\n");
}
