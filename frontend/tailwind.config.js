/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        subtle: "rgb(var(--c-subtle) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        brand: {
          light: "#3f3f46",
          DEFAULT: "rgb(var(--c-brand) / <alpha-value>)",
          dark: "#27272a",
          deep: "#18181b",
        },
        accentfg: "rgb(var(--c-accent-fg) / <alpha-value>)",
        elevated: "rgb(var(--c-elevated, var(--c-card)) / <alpha-value>)",
        navy: {
          900: "#0b1020",
          800: "#111733",
          700: "#1b2347",
        },
        risk: {
          low: "#10b981",
          medium: "#f59e0b",
          high: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)",
        lift: "0 16px 40px -16px rgba(0,0,0,0.18)",
        glow: "0 0 0 1px rgba(0,0,0,0.06), 0 18px 50px -16px rgba(0,0,0,0.2)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        dash: {
          "0%": { strokeDashoffset: "48" },
          "100%": { strokeDashoffset: "0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        driveIn: {
          "0%": { transform: "translateX(-130%)", opacity: "0" },
          "55%": { transform: "translateX(6%)", opacity: "1" },
          "75%": { transform: "translateX(-2%)" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        nod: {
          "0%, 100%": { transform: "rotate(0) translateY(0)" },
          "15%": { transform: "rotate(7deg) translateY(3px)" },
          "30%": { transform: "rotate(0) translateY(0)" },
          "50%": { transform: "rotate(7deg) translateY(3px)" },
          "65%": { transform: "rotate(0) translateY(0)" },
          "82%": { transform: "rotate(4deg) translateY(1px)" },
        },
        wheel: {
          "0%": { transform: "rotate(0)" },
          "100%": { transform: "rotate(360deg)" },
        },
        dropDown: {
          "0%": { transform: "translateY(-26px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.2,0.7,0.3,1) both",
        "fade-in": "fadeIn 0.4s ease-out both",
        "pulse-draw": "dash 1.8s ease-in-out infinite",
        "float-y": "floatY 3s ease-in-out infinite",
        "drive-in": "driveIn 1.1s cubic-bezier(0.2,0.8,0.2,1) both",
        "nod": "nod 0.8s ease-in-out",
        "drop-in": "dropDown 0.5s cubic-bezier(0.2,0.8,0.2,1) both",
      },
    },
  },
  plugins: [],
};
