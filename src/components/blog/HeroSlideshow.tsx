"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Radio } from "lucide-react";
import Link from "next/link";

interface Slide {
  id: string;
  image_url: string;
  caption: string | null;
  position?: string;
  opacity?: number;
  show_caption?: boolean;
  heading?: string | null;
  subtext?: string | null;
}

interface Props {
  slides: Slide[];
}

const DEFAULT_HEADING = "Where Infrastructure\nMeets Intelligence";
const DEFAULT_SUBTEXT = "Deep-dive articles on road tunnel ELV systems, ITS platforms, traffic automation, and smart infrastructure by Tejbir — a practicing Tunnel ELV & Automation specialist.";

export default function HeroSlideshow({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [textFading, setTextFading] = useState(false);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTextFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
      setTextFading(false);
    }, 400);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (!slides || slides.length === 0) return null;

  const slide = slides[current];
  const opacity = (slide.opacity ?? 80) / 100;
  const showCaption = slide.show_caption !== false;

  // Use slide-specific text or fallback to default
  const headingRaw = slide.heading || DEFAULT_HEADING;
  const headingLines = headingRaw.split("\n");
  const subtext = slide.subtext || DEFAULT_SUBTEXT;

  return (
    <div className="relative w-full" style={{ minHeight: "420px" }}>
      {/* Background image */}
      <img
        src={slide.image_url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{
          opacity: fading ? 0 : opacity,
          objectPosition: slide.position || "50% 50%",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-tunnel-950/55" />

      {/* Text content */}
      <div
        className="relative z-10 max-w-3xl mx-auto text-center py-20 px-4 transition-opacity duration-400"
        style={{ opacity: textFading ? 0 : 1 }}
      >
        <div className="inline-flex items-center gap-2 signal-badge mb-6">
          <Radio className="w-3.5 h-3.5" />
          <span>Tejbir Tunnel Expert — ELV & ITS Insights</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          {headingLines.map((line, i) => (
            <span key={i}>
              {i === headingLines.length - 1
                ? <span className="text-signal-amber">{line}</span>
                : <>{line}<br /></>
              }
            </span>
          ))}
        </h1>

        <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
          {subtext}
        </p>

        <div className="flex items-center gap-3 justify-center">
          <Link href="/blog" className="btn-primary">
            Explore Articles <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/search" className="btn-secondary">Search</Link>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-tunnel-900/60 border border-tunnel-600 flex items-center justify-center text-gray-300 hover:text-signal-amber hover:border-signal-amber/50 transition-all"
            aria-label="Previous slide">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-tunnel-900/60 border border-tunnel-600 flex items-center justify-center text-gray-300 hover:text-signal-amber hover:border-signal-amber/50 transition-all"
            aria-label="Next slide">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${i === current ? "bg-signal-amber w-6" : "bg-gray-500 w-2 hover:bg-gray-300"}`}
                aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}

      {/* Caption */}
      {showCaption && slide.caption && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs text-gray-300 bg-tunnel-900/70 px-4 py-1.5 rounded-full whitespace-nowrap">
          {slide.caption}
        </div>
      )}
    </div>
  );
}
