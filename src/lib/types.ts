export type Layout = "list" | "cards";

export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  layout: Layout;
  sort_order: number;
  is_visible: boolean;
};

export type Item = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: string;
  is_available: boolean;
  sort_order: number;
};

export type Settings = {
  shop_name: string;
  slogan: string;
  subtitle: string;
  address: string;
  hours: string;
  phone: string | null;
  currency: string;
};

export type MenuSection = Category & { items: Item[] };

export const DEFAULT_SETTINGS: Settings = {
  shop_name: "NOIR ET CRÈME",
  slogan: "L'ART DU CAFÉ, L'ESPRIT FRAIS",
  subtitle: "A little Oran closer to home",
  address: "Gambetta, Oran",
  hours: "09h00 – 22h00",
  phone: "",
  currency: "DA",
};
