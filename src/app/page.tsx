import Link from "next/link";
import { fetchPublicMenu } from "@/lib/menu";
import { MenuNav } from "@/components/MenuNav";
import { CupMark, Diamond } from "@/components/CupMark";
import type { Item, MenuSection } from "@/lib/types";

export const revalidate = 30;

function PriceTag({ price }: { price: string }) {
  return (
    <span className="shrink-0 font-display text-lg font-semibold tracking-wide text-or-soft sm:text-xl">
      {price}
    </span>
  );
}

function ListRow({ item }: { item: Item }) {
  return (
    <li className="py-2.5">
      <div className="flex items-baseline">
        <span className="font-body text-[15px] font-light text-creme sm:text-base">{item.name}</span>
        <span className="leader" aria-hidden="true" />
        <PriceTag price={item.price} />
      </div>
      {item.description && (
        <p className="mt-0.5 max-w-md font-body text-xs font-light italic text-creme-muted">
          {item.description}
        </p>
      )}
    </li>
  );
}

function CardTile({ item, index }: { item: Item; index: number }) {
  const photo = item.image_url;

  return (
    <article
      className="rise group flex h-full flex-col overflow-hidden rounded-2xl border border-creme/10 bg-noir-card transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-or/45 hover:shadow-[0_20px_55px_-20px_rgba(201,162,39,0.45)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {photo ? (
        <div className="relative aspect-[3/2] overflow-hidden">
          <img
            src={photo}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
          />
          {/* melt the photo into the card instead of stopping at a hard edge */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-noir-card via-noir-card/55 to-transparent" />
        </div>
      ) : (
        // no photo: a compact crest rather than a tall empty frame
        <div className="card-sheen flex h-20 w-full shrink-0 items-center justify-center">
          <CupMark className="h-9 w-9 text-or/60 transition-colors duration-500 group-hover:text-or" />
        </div>
      )}

      <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-3 text-center">
        <h3 className="font-display text-xl font-medium tracking-wide text-creme-soft">
          {item.name}
        </h3>
        {item.description && (
          <p className="mt-1.5 font-body text-[11px] font-light uppercase tracking-[0.14em] text-creme-muted">
            {item.description}
          </p>
        )}
        <div className="mt-auto pt-4">
          <div className="mx-auto h-px w-10 bg-or/40" />
          <p className="mt-3 font-display text-2xl font-semibold text-or-soft">{item.price}</p>
        </div>
      </div>
    </article>
  );
}

/**
 * A product with a photo leads its section as a wide feature, so the picture
 * is big enough to be appetising instead of a thumbnail in a 4-up grid.
 */
function FeatureCard({ item }: { item: Item }) {
  return (
    <article className="rise group grid overflow-hidden rounded-2xl border border-creme/10 bg-noir-card transition-[border-color,box-shadow] duration-500 hover:border-or/45 hover:shadow-[0_24px_60px_-24px_rgba(201,162,39,0.45)] sm:grid-cols-2">
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-auto sm:min-h-[19rem]">
        <img
          src={item.image_url ?? ""}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
        />
        {/* fade the photo into the panel: downward on mobile, sideways on desktop */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-noir-card to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-noir-card to-transparent sm:block" />
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-or/80">
          La signature
        </span>
        <h3 className="mt-3 font-display text-3xl font-medium tracking-wide text-creme-soft sm:text-4xl">
          {item.name}
        </h3>
        {item.description && (
          <p className="mt-2 font-body text-[11px] font-light uppercase tracking-[0.16em] text-creme-muted">
            {item.description}
          </p>
        )}
        <div className="mt-5 h-px w-12 bg-or/40" />
        <p className="mt-4 font-display text-4xl font-semibold text-or-soft">{item.price}</p>
      </div>
    </article>
  );
}

/**
 * Pick a column count that fills the last row, so a 3-card section doesn't
 * render with an empty fourth slot.
 */
function cardGrid(count: number): string {
  if (count <= 1) return "sm:grid-cols-1 lg:grid-cols-1 mx-auto max-w-sm";
  if (count === 2) return "sm:grid-cols-2 lg:grid-cols-2 mx-auto max-w-2xl";
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3";
  if (count % 4 === 0) return "sm:grid-cols-2 lg:grid-cols-4";
  if (count % 3 === 0) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

function Section({ section }: { section: MenuSection }) {
  const featureIndex =
    section.layout === "cards" ? section.items.findIndex((item) => item.image_url) : -1;
  const feature = featureIndex >= 0 ? section.items[featureIndex] : null;
  const tiles = feature ? section.items.filter((_, i) => i !== featureIndex) : section.items;

  return (
    <section id={section.slug} className="scroll-mt-28 py-12 sm:py-16">
      <header className="text-center">
        <h2 className="font-display text-3xl font-medium uppercase tracking-[0.2em] text-creme-soft sm:text-4xl">
          {section.name}
        </h2>
        {section.tagline && (
          <p className="mt-2 font-body text-[11px] font-light uppercase tracking-[0.3em] text-creme-muted">
            {section.tagline}
          </p>
        )}
        <div className="mx-auto mt-5 flex items-center justify-center gap-3">
          <span className="gold-rule w-16 sm:w-24" />
          <Diamond className="h-2 w-2 text-or" />
          <span className="gold-rule w-16 sm:w-24" />
        </div>
      </header>

      {section.layout === "cards" ? (
        <div className="mt-8 space-y-4">
          {feature && <FeatureCard item={feature} />}
          {tiles.length > 0 && (
            <div className={`grid grid-cols-1 gap-4 ${cardGrid(tiles.length)}`}>
              {tiles.map((item, index) => (
                <CardTile key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <ul className="mx-auto mt-7 max-w-2xl divide-y divide-creme/[0.07]">
          {section.items.map((item) => (
            <ListRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function MenuPage() {
  const { sections, settings } = await fetchPublicMenu();

  return (
    <main className="min-h-dvh">
      <header className="relative overflow-hidden px-4 pt-16 pb-12 text-center sm:pt-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 w-72 rounded-full bg-or/10 blur-[90px]"
        />
        <div className="relative">
          <CupMark className="mx-auto h-12 w-12 text-or" />
          <h1 className="mt-6 font-display text-[2.6rem] font-light uppercase leading-[1.05] tracking-[0.16em] text-creme-soft sm:text-6xl">
            {settings.shop_name}
          </h1>
          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <span className="gold-rule w-20 sm:w-28" />
            <Diamond className="h-2 w-2 text-or" />
            <span className="gold-rule w-20 sm:w-28" />
          </div>
          <p className="mt-6 font-display text-base uppercase tracking-[0.28em] text-or-soft sm:text-lg">
            {settings.slogan}
          </p>
          {settings.subtitle && (
            <p className="mt-2 font-body text-sm font-light italic text-creme-dim">
              {settings.subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-body text-[11px] uppercase tracking-[0.2em] text-creme-muted">
            {settings.address && <span>{settings.address}</span>}
            {settings.address && settings.hours && <span className="text-or/60">•</span>}
            {settings.hours && <span>{settings.hours}</span>}
          </div>
        </div>
      </header>

      <MenuNav sections={sections.map((s) => ({ slug: s.slug, name: s.name }))} />

      <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
        {sections.length === 0 ? (
          <p className="py-24 text-center font-body text-sm text-creme-muted">
            La carte est en cours de mise à jour.
          </p>
        ) : (
          sections.map((section) => <Section key={section.id} section={section} />)
        )}
      </div>

      <footer className="mt-8 border-t border-creme/10 bg-black/40">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6">
          <CupMark className="mx-auto h-8 w-8 text-or/60" />
          <p className="mt-5 font-display text-lg uppercase tracking-[0.24em] text-creme-soft">
            {settings.slogan}
          </p>
          {settings.subtitle && (
            <p className="mt-1.5 font-body text-xs font-light italic text-creme-muted">
              {settings.subtitle}
            </p>
          )}
          <div className="mx-auto mt-6 h-px w-24 bg-or/30" />
          <div className="mt-6 space-y-1 font-body text-[11px] uppercase tracking-[0.2em] text-creme-muted">
            {settings.address && <p>{settings.address}</p>}
            {settings.hours && <p>Horaires : {settings.hours}</p>}
            {settings.phone && <p>{settings.phone}</p>}
          </div>
          <p className="mt-8 font-body text-[10px] uppercase tracking-[0.24em] text-creme/25">
            © {new Date().getFullYear()} {settings.shop_name} ·{" "}
            <Link href="/admin" className="transition-colors hover:text-or/70">
              Administration
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
