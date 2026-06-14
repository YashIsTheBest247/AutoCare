import { useRef } from "react";

export default function IntroVideo({ onFinish, src = "/intro.mp4" }) {
  const ref = useRef(null);

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-br from-brand-light via-brand to-brand-dark flex items-center justify-center overflow-hidden animate-fade-in">
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        playsInline
        onEnded={onFinish}
        onError={onFinish}
        className="h-full w-full object-cover"
      />
      <button
        onClick={onFinish}
        className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur text-white text-sm font-semibold px-4 py-2 rounded-full ring-1 ring-white/30 transition-colors"
      >
        Skip intro
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
