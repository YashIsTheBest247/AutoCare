import { useEffect, useRef, useState } from "react";

export default function Select({ value, onChange, options, placeholder = "Select...", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 bg-card border border-line rounded-xl px-3.5 py-2.5 text-sm transition-colors hover:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
      >
        <span className={selected ? "text-ink" : "text-subtle"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-30 mt-2 w-full max-h-60 overflow-auto bg-card border border-line rounded-xl shadow-lift py-1.5 animate-fade-in">
          {options.map((o) => {
            const active = String(o.value) === String(value);
            return (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 text-left px-3.5 py-2 text-sm transition-colors ${
                    active ? "bg-brand text-accentfg" : "text-ink hover:bg-brand/10"
                  }`}
                >
                  {o.label}
                  {active && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
