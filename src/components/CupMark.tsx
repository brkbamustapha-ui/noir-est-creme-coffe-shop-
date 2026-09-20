export function CupMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 22h33v14a14 14 0 0 1-14 14h-5a14 14 0 0 1-14-14V22Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M45 26h4.5a6.5 6.5 0 0 1 0 13H45"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M10 56h40" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M22 14c0-3 3-3 3-6M31 14c0-3 3-3 3-6M40 14c0-3 3-3 3-6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
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
