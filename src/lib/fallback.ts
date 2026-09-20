import type { MenuSection } from "./types";

/**
 * The printed menu, hard-coded. Used when Supabase is unreachable or not yet
 * configured so the public menu never renders empty.
 */
const raw: Array<[string, string, string | null, "list" | "cards", Array<[string, string | null, string]>]> = [
  ["signatures", "NOS SIGNATURES", "Les incontournables de la maison", "cards", [
    ["Espresso Double", "Lavazza / San Marco", "300 DA"],
    ["Café au Lait", "Onctueux, mousse de lait", "350 DA"],
    ["Capucino", "Cacao & lait velouté", "400 DA"],
    ["Café Capsule", "Nespresso / L'Or", "250 DA"],
  ]],
  ["boissons-chaudes", "BOISSONS CHAUDES", "Torréfaction du jour", "list", [
    ["Carte Noire, Lavazza, Saint-Marc, L'Or en Grain", null, "300 DA"],
    ["Double Espresso", null, "550 DA"],
    ["Americano", null, "300 DA"],
    ["Café au lait", null, "300 DA"],
    ["Maxwell", null, "300 DA"],
    ["Capucino", null, "400 DA"],
  ]],
  ["cafes-parfumes", "CAFÉS PARFUMÉS", "Une touche gourmande", "list", [
    ["Café noisette", null, "300 DA"],
    ["Café vanille", null, "300 DA"],
    ["Café caramel", null, "300 DA"],
  ]],
  ["jus-presse", "JUS PRESSÉ", "Pressés minute, fruits frais", "list", [
    ["Mojito classic", null, "400 DA"],
    ["Mojito Blue Ocean", null, "550 DA"],
    ["Mojito strawberry", null, "550 DA"],
    ["Mojito Fruit", null, "700 DA"],
    ["Florida", null, "600 DA"],
    ["Pina colada", null, "700 DA"],
    ["Bora bora", null, "650 DA"],
    ["Pink Lady", null, "650 DA"],
    ["RIO", null, "600 DA"],
    ["Milkshake chocolat banane", null, "600 DA"],
    ["Milkshake fraise", null, "600 DA"],
  ]],
  ["specialites-ete", "SPÉCIALITÉS D'ÉTÉ", "Mocktails & douceurs glacées", "cards", [
    ["Jus d'Orange / Jus de Citron", "Pressés minute", "500 DA / 400 DA"],
    ["Smoothie Healthy", "Vanille, Chocolat, Fruit, Healthy", "600 - 700 DA"],
    ["Milkshake", "Oréo, Bueno, Kitkat", "550 DA"],
  ]],
];

export const FALLBACK_MENU: MenuSection[] = raw.map(([slug, name, tagline, layout, items], ci) => ({
  id: `fallback-${slug}`,
  slug,
  name,
  tagline,
  layout,
  sort_order: ci + 1,
  is_visible: true,
  items: items.map(([itemName, description, price], ii) => ({
    id: `fallback-${slug}-${ii}`,
    category_id: `fallback-${slug}`,
    name: itemName,
    description,
    price,
    is_available: true,
    sort_order: ii + 1,
  })),
}));
