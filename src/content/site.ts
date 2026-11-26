const city = "Благовещенск";
const address = process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "";
const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const phoneNumber = phone.replace(/[^\d+]/g, "");

export const company = {
  name: "Просто мебель",
  city,
  location: "Мебель на заказ в Благовещенске",
  contactLocation: address ? city + ", " + address : city,
  phone,
  phoneHref: phoneNumber ? "tel:" + phoneNumber : "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  studio: "SLOY",
};

export const navigation = [
  { href: "#top", label: "Главная" },
  { href: "#furniture", label: "Мебель" },
  { href: "#materials", label: "Материалы" },
  { href: "#about", label: "О компании" },
  { href: "#contacts", label: "Контакты" },
];

export type Photo = {
  name: string;
  alt: string;
  position?: string;
};

export const cover: Photo = {
  name: "cover",
  alt: "Кухня с высокими деревянными фасадами и светлой столешницей в жилом интерьере",
};

export const approach = {
  heading: ["Всё начинается", "с пространства."],
  description: "Как вы готовите, где храните вещи, что хочется оставить на виду. Из этих привычек складывается мебель, которой удобно пользоваться каждый день.",
  photo: {
    name: "approach",
    alt: "Светлые деревянные фасады над узорчатым кухонным фартуком",
  },
};

export const furniture = [
  {
    title: "Кухни",
    description: "Рабочие поверхности и хранение под ваши привычки.",
    photo: { name: "kitchen", alt: "Компактная кухня с деревянными фасадами и открытой полкой у окна" },
  },
  {
    title: "Шкафы",
    description: "Встроенные решения для прихожих, спален и ниш.",
    photo: { name: "wardrobe", alt: "Встроенный шкаф с ровными фасадами в светлой прихожей" },
  },
  {
    title: "Гардеробные",
    description: "Полки, штанги и ящики, чтобы у каждой вещи было своё место.",
    photo: { name: "closet", alt: "Гардеробная с деревянными полками, штангами и подсветкой" },
  },
  {
    title: "Корпусная мебель",
    description: "Тумбы, стеллажи и мебель для жилых комнат.",
    photo: { name: "casework", alt: "Встроенная мебель из дерева с открытыми полками и подсветкой в квартире" },
  },
];

export const interiors = [
  {
    title: "Тёмное дерево и терраццо",
    photo: { name: "interior-kitchen", alt: "Кухня небольшой квартиры с тёмными деревянными фасадами и столешницей из терраццо" },
  },
  {
    title: "Открытые полки в нише",
    photo: { name: "interior-storage", alt: "Открытые деревянные полки и выдвижные ящики в нише" },
  },
  {
    title: "Тумба для небольшой ванной",
    photo: { name: "interior-bath", alt: "Небольшая ванная с деревянной тумбой и зеркальным шкафом", position: "77% center" },
  },
  {
    title: "Дерево в светлой гостиной",
    photo: { name: "interior-living", alt: "Светлая гостиная с деревянной тумбой и диваном у окна" },
  },
];

export const materials = [
  {
    title: "Рисунок дерева",
    photo: { name: "wood-grain", alt: "Древесная поверхность с заметным рисунком волокон" },
  },
  {
    title: "Фасады и столешница",
    photo: { name: "wood-fronts", alt: "Стык деревянной стеновой панели и светлой столешницы над фасадами с ручками" },
  },
  {
    title: "Ручки и детали",
    photo: { name: "wood-handle", alt: "Крупный план деревянного ящика с углублением для руки" },
  },
];

export const orderSteps = [
  { title: "Обсуждение задачи", description: "Определить назначение мебели и составить список пожеланий." },
  { title: "Замер", description: "Снять размеры и учесть розетки, трубы и выступы." },
  { title: "Проектирование", description: "Продумать компоновку, наполнение и открывание фасадов." },
  { title: "Согласование", description: "Выбрать отделку, уточнить детали и утвердить проект." },
  { title: "Изготовление", description: "Подготовить детали по согласованному проекту." },
  { title: "Монтаж", description: "Установить мебель и проверить работу дверец и ящиков." },
];

// «По вашим размерам»: первые три экрана

export const hero = {
  lines: [["ПО", "ВАШИМ"], ["РАЗМЕРАМ"]],
  title: "По вашим размерам",
  caption: "Мебель на заказ в Благовещенске",
  action: "Рассчитать по вашим размерам",
  photoAlt: "Кухня с высокими деревянными фасадами, островом и барными стульями в жилом интерьере",
};

// Размеры в демо примерные: на странице они подписаны как примерные.
// В версии для клиента сюда подставляются размеры его настоящих работ.
export const dimensions = {
  heroWidth: 2640,
  heroHeight: 2400,
  note: "Размеры на схеме приведены как пример",
};

export const roomSlugs = ["kitchens", "wardrobes", "dressing-rooms", "hallways", "children"] as const;
export type RoomSlug = (typeof roomSlugs)[number];

export type Room = {
  slug: RoomSlug;
  title: string;
  action: string;
  intro: string;
  note: string;
  image: string;
  alt: string;
  position?: string;
};

export const rooms: Room[] = [
  {
    slug: "kitchens", title: "Кухни", action: "Рассчитать стоимость кухни",
    intro: "Кухни на заказ в Благовещенске. Планировка, рабочая поверхность и хранение под ваши размеры.",
    note: "Рабочие поверхности и хранение под ваши привычки.", image: "cover", alt: hero.photoAlt,
  },
  {
    slug: "wardrobes", title: "Шкафы", action: "Рассчитать стоимость шкафа",
    intro: "Шкаф по размерам ниши или комнаты. Выберите двери и распределите место для полок, ящиков и одежды на плечиках.",
    note: "Встроенные решения для спален и ниш.", image: "shkafy", alt: "Встроенный шкаф из светлого дерева с открытыми полками в спальне", position: "35% 50%",
  },
  {
    slug: "dressing-rooms", title: "Гардеробные", action: "Рассчитать стоимость гардеробной",
    intro: "Укажите размеры помещения и выберите, вдоль каких стен разместить полки, штанги и ящики.",
    note: "Полки, штанги и ящики, чтобы у каждой вещи было своё место.", image: "closet", alt: "Гардеробная с деревянными полками, штангами и подсветкой", position: "50% 58%",
  },
  {
    slug: "hallways", title: "Прихожие", action: "Рассчитать стоимость мебели для прихожей",
    intro: "Соберите систему хранения по размерам прихожей. Укажите, где нужны шкаф, обувница, зеркало и сиденье.",
    note: "Хранение у входа по размерам вашего коридора.", image: "prihozhie", alt: "Светлая прихожая с деревянным шкафом, круглым зеркалом и растением", position: "50% 42%",
  },
  {
    slug: "children", title: "Детские", action: "Рассчитать стоимость детской мебели",
    intro: "Спланируйте шкаф, письменное место или систему хранения с учётом размеров комнаты.",
    note: "Хранение, письменное место и скамья у окна.", image: "detskie", alt: "Детская комната со встроенными полками, скамьёй у окна и мягкими подушками", position: "60% 50%",
  },
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const withBase = (path: string) => basePath + path;

export const roomPath = (room: RoomSlug) => `/${room}/`;
export const furniturePath = (room: RoomSlug) => room === "kitchens" ? "/#furniture" : `/#furniture-${room}`;

export const roomHref = (room: RoomSlug) => withBase(roomPath(room));
export const furnitureHref = (room: RoomSlug) => withBase(furniturePath(room));

export function roomFromHash(hash: string): RoomSlug | undefined {
  return roomSlugs.find((slug) => furniturePath(slug).slice(1) === hash);
}

export function roomImage(room: Room) {
  const base = withBase(`/images/${room.image}`);
  return room.slug === "kitchens"
    ? { src: `${base}-1600.webp`, srcSet: `${base}-1000.webp 1000w, ${base}-1600.webp 1600w, ${base}-2400.webp 2400w` }
    : { src: `${base}-1400.webp`, srcSet: `${base}-900.webp 900w, ${base}-1400.webp 1400w` };
}
