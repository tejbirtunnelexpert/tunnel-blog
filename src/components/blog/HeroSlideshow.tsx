"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: string;
  image_url: string;
  caption: string | null;
}

interface Props {
  slides: Slide[];
}

export default function HeroSlideshow({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
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
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {/* Background image */}
      <img
        src={slides[current].image_url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
        style={{ opacity: fading ? 0 : 1 }}
      />
      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-tunnel-950/70" />

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-tunnel-900/60 border border-tunnel-600 flex items-center justify-center text-gray-300 hover:text-signal-amber hover:border-signal-amber/50 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-tunnel-900/60 border border-tunnel-600 flex items-center justify-center text-gray-300 hover:text-signal-amber hover:border-signal-amber/50 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? "bg-signal-amber w-6"
                    : "bg-gray-500 hover:bg-gray-300"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Caption */}
      {slides[current].caption && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs text-gray-400 bg-tunnel-900/60 px-3 py-1 rounded-full">
          {slides[current].caption}
        </div>
      )}
    </div>
  );
}
