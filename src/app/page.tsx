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
  return (
    <article
      className="card-sheen rise group flex flex-col items-center rounded-2xl border border-creme/10 p-6 text-center transition-colors duration-500 hover:border-or/40"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <CupMark className="h-10 w-10 text-or/70 transition-colors duration-500 group-hover:text-or" />
      <h3 className="mt-4 font-display text-xl font-medium tracking-wide text-creme-soft">
        {item.name}
      </h3>
      {item.description && (
        <p className="mt-1.5 font-body text-[11px] font-light uppercase tracking-[0.14em] text-creme-muted">
          {item.description}
        </p>
      )}
      <div className="mt-4 h-px w-10 bg-or/40" />
      <p className="mt-3 font-display text-2xl font-semibold text-or-soft">{item.price}</p>
    </article>
  );
}

function Section({ section }: { section: MenuSection }) {
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
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => (
            <CardTile key={item.id} item={item} index={index} />
          ))}
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
