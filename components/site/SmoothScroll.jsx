"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
export const getLenis = () => lenis;

// Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger animations
// stay perfectly in sync with the scroll position.
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      anchors: { offset: -96 },
      stopInertiaOnNavigate: true,
      autoRaf: false,
    });
    lenis = instance;

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, []);

  // Re-measure scroll-driven animations after each page change and once fonts settle.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
