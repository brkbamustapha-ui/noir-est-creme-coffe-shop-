"use client";

import { useEffect, useState } from "react";

type NavSection = { slug: string; name: string };

export function MenuNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.slug ?? "");

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // band across the upper-middle of the viewport, so the pill tracks the
      // section the reader is actually looking at
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );

    for (const section of sections) {
      const element = document.getElementById(section.slug);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Catégories"
      className="sticky top-0 z-40 border-b border-creme/10 bg-noir/85 backdrop-blur-md"
    >
      <ul className="no-bar mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3 sm:justify-center">
        {sections.map((section) => {
          const isActive = active === section.slug;
          return (
            <li key={section.slug} className="shrink-0">
              <a
                href={`#${section.slug}`}
                aria-current={isActive ? "true" : undefined}
                className={`block whitespace-nowrap rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive
                    ? "border-or/70 bg-or/15 text-or-soft"
                    : "border-creme/15 text-creme/60 hover:border-creme/35 hover:text-creme"
                }`}
              >
                {section.name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
