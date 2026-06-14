export function LogoMark({ className = "h-9 w-9", id = "acg" }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="4" y1="36" x2="36" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#93b8ff" />
          <stop offset="0.5" stopColor="#0a6be8" />
          <stop offset="1" stopColor="#0553c0" />
        </linearGradient>
      </defs>
      <path
        d="M7 35 L20 6 L33 35"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M13 25 H25"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="29.5" cy="13.5" r="3.4" fill="#4d97ff" />
      <circle cx="29.5" cy="13.5" r="3.4" fill="#4d97ff" className="animate-float-y" />
    </svg>
  );
}

export default function Logo({ onDark = false, showBadge = true, markClassName = "h-9 w-9" }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className={markClassName} />
      <span className={`text-xl font-extrabold tracking-tight ${onDark ? "text-white" : "text-ink"}`}>
        AutoCare
      </span>
      {showBadge && (
        <span className="bg-gradient-to-r from-brand to-brand-light text-white text-sm font-extrabold px-2 py-0.5 rounded-md leading-tight">
          AI
        </span>
      )}
    </div>
  );
}
