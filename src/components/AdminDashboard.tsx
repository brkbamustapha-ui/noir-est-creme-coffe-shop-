"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CupMark } from "@/components/CupMark";
import { prepareImage } from "@/lib/image";
import type { Item, MenuSection, Settings } from "@/lib/types";

type Props = {
  sections: MenuSection[];
  settings: Settings;
  offline: boolean;
  missingCount: number;
  username: string;
};

type ItemDraft = {
  id: string | null;
  category_id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  is_available: boolean;
  sort_order: number;
};

type CategoryDraft = {
  id: string | null;
  name: string;
  tagline: string;
  layout: "list" | "cards";
  sort_order: number;
  is_visible: boolean;
};

const field =
  "w-full rounded-lg border border-creme/15 bg-black/40 px-3 py-2 font-body text-sm text-creme outline-none transition-colors focus:border-or/60";
const label = "block font-body text-[10px] uppercase tracking-[0.18em] text-creme-muted";
const btnGold =
  "rounded-lg bg-or px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-noir transition-opacity hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "rounded-lg border border-creme/20 px-3 py-2 font-body text-[11px] uppercase tracking-[0.16em] text-creme/80 transition-colors hover:border-creme/40 hover:text-creme disabled:opacity-50";

export function AdminDashboard({ sections, settings, offline, missingCount, username }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [tab, setTab] = useState<"carte" | "categories" | "infos" | "acces">("carte");

  const [itemDraft, setItemDraft] = useState<ItemDraft | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);
  const [form, setForm] = useState<Settings>(settings);
  const [access, setAccess] = useState({
    username,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const stats = useMemo(() => {
    const items = sections.flatMap((section) => section.items);
    return {
      categories: sections.length,
      items: items.length,
      hidden: items.filter((item) => !item.is_available).length,
    };
  }, [sections]);

  function notify(kind: "ok" | "err", text: string) {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 3500);
  }

  async function send(url: string, init: RequestInit, okMessage: string): Promise<boolean> {
    setBusy(true);
    try {
      const response = await fetch(url, init);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        notify("err", payload.error || "Échec de l'enregistrement.");
        return false;
      }
      notify("ok", okMessage);
      startTransition(() => router.refresh());
      return true;
    } catch {
      notify("err", "Réseau indisponible.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const json = (body: unknown): RequestInit => ({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // so the same file can be picked again after an error
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return notify("err", "Choisissez une image (JPG, PNG ou WebP).");
    }

    setUploading(true);
    try {
      const prepared = await prepareImage(file);
      const body = new FormData();
      body.append("file", prepared);

      const response = await fetch("/api/admin/photos", { method: "POST", body });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        notify("err", payload.error || "Envoi de la photo impossible.");
        return;
      }
      setItemDraft((draft) => (draft ? { ...draft, image_url: payload.url } : draft));
      notify("ok", "Photo importée.");
    } catch {
      notify("err", "Cette image n'a pas pu être lue.");
    } finally {
      setUploading(false);
    }
  }

  async function saveItem() {
    if (!itemDraft?.name.trim()) return notify("err", "Le nom est obligatoire.");
    const ok = await send("/api/admin/items", json(itemDraft), "Produit enregistré.");
    if (ok) setItemDraft(null);
  }

  async function deleteItem(item: Item) {
    if (!window.confirm(`Supprimer « ${item.name} » ?`)) return;
    await send(`/api/admin/items?id=${item.id}`, { method: "DELETE" }, "Produit supprimé.");
  }

  async function toggleItem(item: Item) {
    await send(
      "/api/admin/items",
      json({ ...item, is_available: !item.is_available }),
      item.is_available ? "Produit masqué." : "Produit affiché.",
    );
  }

  async function saveCategory() {
    if (!categoryDraft?.name.trim()) return notify("err", "Le nom est obligatoire.");
    const ok = await send("/api/admin/categories", json(categoryDraft), "Catégorie enregistrée.");
    if (ok) setCategoryDraft(null);
  }

  async function deleteCategory(section: MenuSection) {
    if (
      !window.confirm(
        `Supprimer la catégorie « ${section.name} » et ses ${section.items.length} produit(s) ?`,
      )
    )
      return;
    await send(
      `/api/admin/categories?id=${section.id}`,
      { method: "DELETE" },
      "Catégorie supprimée.",
    );
  }

  async function saveAccess() {
    if (access.newPassword !== access.confirmPassword) {
      return notify("err", "Les deux mots de passe ne correspondent pas.");
    }
    const ok = await send(
      "/api/admin/credentials",
      json({
        currentPassword: access.currentPassword,
        username: access.username,
        newPassword: access.newPassword,
      }),
      "Identifiants mis à jour.",
    );
    if (ok) {
      setAccess((a) => ({ ...a, currentPassword: "", newPassword: "", confirmPassword: "" }));
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const working = busy || pending || uploading;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-creme/10 bg-noir/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <CupMark className="h-7 w-7 shrink-0 text-or" />
            <div className="leading-tight">
              <p className="font-display text-lg uppercase tracking-[0.14em] text-creme-soft">
                Noir et Crème
              </p>
              <p className="font-body text-[9px] uppercase tracking-[0.22em] text-creme-muted">
                Tableau de bord
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className={btnGhost}>
              Voir la carte
            </a>
            <button type="button" onClick={logout} className={btnGhost}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {offline && (
          <p className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 font-body text-xs text-amber-200">
            Base de données injoignable — la carte de secours est affichée. Les modifications ne
            seront pas enregistrées tant que la connexion Supabase n&apos;est pas rétablie.
          </p>
        )}

        {missingCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
            <p className="flex-1 font-body text-xs text-amber-200">
              {missingCount} produit(s) de la carte de référence ne figurent plus dans le menu.
            </p>
            <button
              type="button"
              disabled={working}
              onClick={() =>
                send("/api/admin/restore", { method: "POST" }, "Produits restaurés.")
              }
              className={btnGold}
            >
              Restaurer
            </button>
          </div>
        )}

        <section className="grid grid-cols-3 gap-3">
          {[
            ["Catégories", stats.categories],
            ["Produits", stats.items],
            ["Masqués", stats.hidden],
          ].map(([title, value]) => (
            <div
              key={title as string}
              className="card-sheen rounded-xl border border-creme/10 px-4 py-4 text-center"
            >
              <p className="font-display text-3xl font-semibold text-or-soft">{value}</p>
              <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-creme-muted">
                {title}
              </p>
            </div>
          ))}
        </section>

        <nav className="mt-8 flex gap-2 border-b border-creme/10">
          {(
            [
              ["carte", "Carte"],
              ["categories", "Catégories"],
              ["infos", "Infos du café"],
              ["acces", "Identifiants"],
            ] as const
          ).map(([key, title]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-4 py-2.5 font-body text-[11px] uppercase tracking-[0.16em] transition-colors ${
                tab === key
                  ? "border-or text-or-soft"
                  : "border-transparent text-creme/50 hover:text-creme"
              }`}
            >
              {title}
            </button>
          ))}
        </nav>

        {tab === "carte" && (
          <section className="mt-6 space-y-8">
            {sections.length === 0 && (
              <p className="font-body text-sm text-creme-muted">
                Aucune catégorie. Créez-en une dans l&apos;onglet « Catégories ».
              </p>
            )}

            {sections.map((section) => (
              <div key={section.id}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-creme/10 pb-2">
                  <h2 className="font-display text-xl uppercase tracking-[0.14em] text-creme-soft">
                    {section.name}
                    {!section.is_visible && (
                      <span className="ml-2 rounded bg-creme/10 px-2 py-0.5 font-body text-[9px] uppercase tracking-[0.14em] text-creme-muted">
                        masquée
                      </span>
                    )}
                  </h2>
                  <button
                    type="button"
                    disabled={working}
                    onClick={() =>
                      setItemDraft({
                        id: null,
                        category_id: section.id,
                        name: "",
                        description: "",
                        price: "",
                        image_url: "",
                        is_available: true,
                        sort_order: section.items.length + 1,
                      })
                    }
                    className={btnGhost}
                  >
                    + Produit
                  </button>
                </div>

                <ul className="divide-y divide-creme/[0.07]">
                  {section.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded-md object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-body text-sm ${
                            item.is_available ? "text-creme" : "text-creme/35 line-through"
                          }`}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="font-body text-[11px] italic text-creme-muted">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="font-display text-lg font-semibold text-or-soft">
                        {item.price}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => toggleItem(item)}
                          title={item.is_available ? "Masquer" : "Afficher"}
                          className="rounded-lg border border-creme/15 px-2.5 py-1.5 font-body text-[10px] uppercase tracking-[0.12em] text-creme/70 transition-colors hover:border-creme/40 disabled:opacity-50"
                        >
                          {item.is_available ? "Masquer" : "Afficher"}
                        </button>
                        <button
                          type="button"
                          disabled={working}
                          onClick={() =>
                            setItemDraft({
                              id: item.id,
                              category_id: item.category_id,
                              name: item.name,
                              description: item.description ?? "",
                              price: item.price,
                              image_url: item.image_url ?? "",
                              is_available: item.is_available,
                              sort_order: item.sort_order,
                            })
                          }
                          className="rounded-lg border border-creme/15 px-2.5 py-1.5 font-body text-[10px] uppercase tracking-[0.12em] text-creme/70 transition-colors hover:border-or/50 disabled:opacity-50"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => deleteItem(item)}
                          className="rounded-lg border border-red-500/25 px-2.5 py-1.5 font-body text-[10px] uppercase tracking-[0.12em] text-red-300/80 transition-colors hover:border-red-500/60 disabled:opacity-50"
                        >
                          Suppr.
                        </button>
                      </div>
                    </li>
                  ))}
                  {section.items.length === 0 && (
                    <li className="py-3 font-body text-xs text-creme-muted">Aucun produit.</li>
                  )}
                </ul>
              </div>
            ))}
          </section>
        )}

        {tab === "categories" && (
          <section className="mt-6">
            <button
              type="button"
              disabled={working}
              onClick={() =>
                setCategoryDraft({
                  id: null,
                  name: "",
                  tagline: "",
                  layout: "list",
                  sort_order: sections.length + 1,
                  is_visible: true,
                })
              }
              className={btnGold}
            >
              + Nouvelle catégorie
            </button>

            <ul className="mt-5 space-y-2">
              {sections.map((section) => (
                <li
                  key={section.id}
                  className="card-sheen flex flex-wrap items-center gap-3 rounded-xl border border-creme/10 px-4 py-3"
                >
                  <span className="font-display text-base uppercase tracking-[0.12em] text-creme-soft">
                    {section.name}
                  </span>
                  <span className="rounded bg-creme/10 px-2 py-0.5 font-body text-[9px] uppercase tracking-[0.14em] text-creme-muted">
                    {section.layout === "cards" ? "vignettes" : "liste"}
                  </span>
                  <span className="font-body text-[11px] text-creme-muted">
                    {section.items.length} produit(s) · ordre {section.sort_order}
                  </span>
                  <div className="ml-auto flex gap-1.5">
                    <button
                      type="button"
                      disabled={working}
                      onClick={() =>
                        setCategoryDraft({
                          id: section.id,
                          name: section.name,
                          tagline: section.tagline ?? "",
                          layout: section.layout,
                          sort_order: section.sort_order,
                          is_visible: section.is_visible,
                        })
                      }
                      className={btnGhost}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => deleteCategory(section)}
                      className="rounded-lg border border-red-500/25 px-3 py-2 font-body text-[11px] uppercase tracking-[0.16em] text-red-300/80 transition-colors hover:border-red-500/60 disabled:opacity-50"
                    >
                      Suppr.
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === "infos" && (
          <section className="mt-6 max-w-xl">
            <div className="card-sheen space-y-4 rounded-xl border border-creme/10 p-5">
              {(
                [
                  ["shop_name", "Nom du café"],
                  ["slogan", "Slogan"],
                  ["subtitle", "Sous-titre"],
                  ["address", "Adresse"],
                  ["hours", "Horaires"],
                  ["phone", "Téléphone"],
                ] as const
              ).map(([key, title]) => (
                <div key={key}>
                  <label className={label} htmlFor={`settings-${key}`}>
                    {title}
                  </label>
                  <input
                    id={`settings-${key}`}
                    className={`${field} mt-1.5`}
                    value={(form[key] as string) ?? ""}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  />
                </div>
              ))}
              <button
                type="button"
                disabled={working}
                onClick={() => send("/api/admin/settings", json(form), "Infos enregistrées.")}
                className={btnGold}
              >
                Enregistrer
              </button>
            </div>
          </section>
        )}
        {tab === "acces" && (
          <section className="mt-6 max-w-xl">
            <div className="card-sheen space-y-4 rounded-xl border border-creme/10 p-5">
              <div>
                <label className={label} htmlFor="acc-user">Identifiant</label>
                <input
                  id="acc-user"
                  className={`${field} mt-1.5`}
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={access.username}
                  onChange={(event) => setAccess({ ...access, username: event.target.value })}
                />
              </div>

              <div className="h-px bg-creme/10" />

              <div>
                <label className={label} htmlFor="acc-current">Mot de passe actuel</label>
                <input
                  id="acc-current"
                  type="password"
                  autoComplete="current-password"
                  className={`${field} mt-1.5`}
                  value={access.currentPassword}
                  onChange={(event) =>
                    setAccess({ ...access, currentPassword: event.target.value })
                  }
                />
              </div>
              <div>
                <label className={label} htmlFor="acc-new">Nouveau mot de passe</label>
                <input
                  id="acc-new"
                  type="password"
                  autoComplete="new-password"
                  className={`${field} mt-1.5`}
                  value={access.newPassword}
                  onChange={(event) => setAccess({ ...access, newPassword: event.target.value })}
                />
              </div>
              <div>
                <label className={label} htmlFor="acc-confirm">Confirmer le nouveau mot de passe</label>
                <input
                  id="acc-confirm"
                  type="password"
                  autoComplete="new-password"
                  className={`${field} mt-1.5`}
                  value={access.confirmPassword}
                  onChange={(event) =>
                    setAccess({ ...access, confirmPassword: event.target.value })
                  }
                />
              </div>

              <button type="button" disabled={working} onClick={saveAccess} className={btnGold}>
                Enregistrer les identifiants
              </button>

              <p className="font-body text-[10px] leading-relaxed text-creme-muted">
                Le mot de passe actuel est demandé pour confirmer. Minimum 8 caractères,
                identifiant 3 caractères. À la connexion, la casse, les accents et les
                espaces en double ne sont pas pris en compte. Les autres appareils déjà
                connectés le restent jusqu&apos;à l&apos;expiration de leur session (8 h).
              </p>
            </div>
          </section>
        )}
      </main>

      {itemDraft && (
        <Modal title={itemDraft.id ? "Modifier le produit" : "Nouveau produit"} onClose={() => setItemDraft(null)}>
          <div>
            <label className={label} htmlFor="item-category">Catégorie</label>
            <select
              id="item-category"
              className={`${field} mt-1.5`}
              value={itemDraft.category_id}
              onChange={(event) => setItemDraft({ ...itemDraft, category_id: event.target.value })}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id} className="bg-noir">
                  {section.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="item-name">Nom</label>
            <input
              id="item-name"
              className={`${field} mt-1.5`}
              value={itemDraft.name}
              onChange={(event) => setItemDraft({ ...itemDraft, name: event.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className={label} htmlFor="item-desc">Description (optionnel)</label>
            <input
              id="item-desc"
              className={`${field} mt-1.5`}
              value={itemDraft.description}
              onChange={(event) => setItemDraft({ ...itemDraft, description: event.target.value })}
            />
          </div>
          <div>
            <span className={label}>Photo (optionnel)</span>

            <div className="mt-1.5 flex flex-wrap gap-2">
              <label
                className={`${btnGhost} cursor-pointer ${uploading ? "opacity-50" : ""}`}
                aria-busy={uploading}
              >
                {uploading ? "Envoi…" : "Importer une photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploading}
                  onChange={uploadPhoto}
                />
              </label>
              {itemDraft.image_url && (
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => setItemDraft({ ...itemDraft, image_url: "" })}
                >
                  Retirer
                </button>
              )}
            </div>

            <input
              id="item-image"
              className={`${field} mt-2`}
              placeholder="…ou coller un lien"
              value={itemDraft.image_url}
              onChange={(event) => setItemDraft({ ...itemDraft, image_url: event.target.value })}
            />

            {itemDraft.image_url && (
              <img
                src={itemDraft.image_url}
                alt=""
                className="mt-2 h-28 w-full rounded-lg object-cover"
              />
            )}
            <p className="mt-1.5 font-body text-[10px] text-creme-muted">
              La photo est réduite automatiquement avant l&apos;envoi.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="item-price">Prix</label>
              <input
                id="item-price"
                className={`${field} mt-1.5`}
                placeholder="300 DA"
                value={itemDraft.price}
                onChange={(event) => setItemDraft({ ...itemDraft, price: event.target.value })}
              />
            </div>
            <div>
              <label className={label} htmlFor="item-order">Ordre</label>
              <input
                id="item-order"
                type="number"
                className={`${field} mt-1.5`}
                value={itemDraft.sort_order}
                onChange={(event) =>
                  setItemDraft({ ...itemDraft, sort_order: Number(event.target.value) || 0 })
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2 font-body text-xs text-creme/80">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#c9a227]"
              checked={itemDraft.is_available}
              onChange={(event) =>
                setItemDraft({ ...itemDraft, is_available: event.target.checked })
              }
            />
            Visible sur la carte
          </label>
          <div className="flex gap-2 pt-1">
            <button type="button" disabled={working} onClick={saveItem} className={btnGold}>
              {working ? "…" : "Enregistrer"}
            </button>
            <button type="button" onClick={() => setItemDraft(null)} className={btnGhost}>
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {categoryDraft && (
        <Modal
          title={categoryDraft.id ? "Modifier la catégorie" : "Nouvelle catégorie"}
          onClose={() => setCategoryDraft(null)}
        >
          <div>
            <label className={label} htmlFor="cat-name">Nom</label>
            <input
              id="cat-name"
              className={`${field} mt-1.5`}
              value={categoryDraft.name}
              onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className={label} htmlFor="cat-tagline">Sous-titre (optionnel)</label>
            <input
              id="cat-tagline"
              className={`${field} mt-1.5`}
              value={categoryDraft.tagline}
              onChange={(event) =>
                setCategoryDraft({ ...categoryDraft, tagline: event.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="cat-layout">Affichage</label>
              <select
                id="cat-layout"
                className={`${field} mt-1.5`}
                value={categoryDraft.layout}
                onChange={(event) =>
                  setCategoryDraft({
                    ...categoryDraft,
                    layout: event.target.value as "list" | "cards",
                  })
                }
              >
                <option value="list" className="bg-noir">Liste</option>
                <option value="cards" className="bg-noir">Vignettes</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="cat-order">Ordre</label>
              <input
                id="cat-order"
                type="number"
                className={`${field} mt-1.5`}
                value={categoryDraft.sort_order}
                onChange={(event) =>
                  setCategoryDraft({
                    ...categoryDraft,
                    sort_order: Number(event.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2 font-body text-xs text-creme/80">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#c9a227]"
              checked={categoryDraft.is_visible}
              onChange={(event) =>
                setCategoryDraft({ ...categoryDraft, is_visible: event.target.checked })
              }
            />
            Visible sur la carte
          </label>
          <div className="flex gap-2 pt-1">
            <button type="button" disabled={working} onClick={saveCategory} className={btnGold}>
              {working ? "…" : "Enregistrer"}
            </button>
            <button type="button" onClick={() => setCategoryDraft(null)} className={btnGhost}>
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-lg px-4 py-2.5 font-body text-xs shadow-lg ${
            toast.kind === "ok"
              ? "bg-or text-noir"
              : "border border-red-500/40 bg-red-950 text-red-200"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-creme/15 bg-noir-card p-5 sm:rounded-2xl"
      >
        <h3 className="mb-4 font-display text-xl uppercase tracking-[0.12em] text-creme-soft">
          {title}
        </h3>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
