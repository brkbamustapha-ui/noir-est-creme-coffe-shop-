/**
 * Brand assets exported from the Noir & Crème logo. The dark field of the
 * original artwork is keyed out, so both files sit on the page background
 * rather than on a black rectangle.
 *
 * Intrinsic sizes are declared to reserve the right box before the image
 * lands, which keeps the header from jumping.
 */
const LOCKUP = { src: "/brand/logo.webp", width: 760, height: 630 };
const MARK = { src: "/brand/monogram.webp", width: 320, height: 470 };

type LockupProps = {
  className?: string;
  /** Accessible name — pass the shop name when the lockup stands in for it. */
  alt: string;
  /** Set on the logo that opens the page, so it is fetched before anything else. */
  priority?: boolean;
};

/** Full logo: crest, « Noir & Crème » wordmark and the café shop line. */
export function BrandLockup({ className = "", alt, priority = false }: LockupProps) {
  return (
    <img
      src={LOCKUP.src}
      alt={alt}
      width={LOCKUP.width}
      height={LOCKUP.height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}

/** The oval NC crest alone, for places too tight for the full lockup. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <img
      src={MARK.src}
      alt=""
      aria-hidden="true"
      width={MARK.width}
      height={MARK.height}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

/** Small decorative diamond used between sections. */
export function Diamond({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path d="M6 0.5 11.5 6 6 11.5 0.5 6Z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
