import { getSupabase } from "./supabase";
import { FALLBACK_MENU } from "./fallback";
import { DEFAULT_SETTINGS, type Category, type Item, type MenuSection, type Settings } from "./types";

export type MenuData = {
  sections: MenuSection[];
  settings: Settings;
  /** true when the data came from the hard-coded fallback rather than the DB */
  offline: boolean;
};

function assemble(categories: Category[], items: Item[]): MenuSection[] {
  return categories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map((category) => ({
      ...category,
      items: items
        .filter((item) => item.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    }));
}

/** Full menu including hidden categories and unavailable items (admin view). */
export async function fetchMenu(): Promise<MenuData> {
  const supabase = getSupabase();
  if (!supabase) {
    return { sections: FALLBACK_MENU, settings: DEFAULT_SETTINGS, offline: true };
  }

  try {
    const [categoriesResult, itemsResult, settingsResult] = await Promise.all([
      supabase.from("noir_categories").select("*"),
      supabase.from("noir_items").select("*"),
      supabase.from("noir_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (itemsResult.error) throw itemsResult.error;

    const categories = (categoriesResult.data ?? []) as Category[];
    if (categories.length === 0) {
      return { sections: FALLBACK_MENU, settings: DEFAULT_SETTINGS, offline: true };
    }

    return {
      sections: assemble(categories, (itemsResult.data ?? []) as Item[]),
      settings: { ...DEFAULT_SETTINGS, ...(settingsResult.data ?? {}) } as Settings,
      offline: false,
    };
  } catch {
    return { sections: FALLBACK_MENU, settings: DEFAULT_SETTINGS, offline: true };
  }
}

/** What the public menu shows: visible categories, available items, no empties. */
export async function fetchPublicMenu(): Promise<MenuData> {
  const data = await fetchMenu();
  return {
    ...data,
    sections: data.sections
      .filter((section) => section.is_visible)
      .map((section) => ({ ...section, items: section.items.filter((item) => item.is_available) }))
      .filter((section) => section.items.length > 0),
  };
}
