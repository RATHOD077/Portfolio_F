"use client";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Must be a stable function for the whole app lifetime (tsParticles v4 requirement).
async function initEngine(engine) {
  await loadSlim(engine);
}

// A quiet field of drifting points; nearby points link up around the cursor.
export default function HeroParticles() {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const dark = resolvedTheme !== "light";
  const ink = dark ? "#ecebe4" : "#161513";
  const brand = dark ? "#ff5c26" : "#d4420c";

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 80, density: { enable: true, width: 1600, height: 900 } },
        paint: { color: { value: ink }, fill: { enable: true, color: { value: ink } } },
        color: { value: ink },
        opacity: { value: { min: 0.12, max: 0.45 } },
        size: { value: { min: 0.6, max: 1.8 } },
        links: { enable: true, distance: 120, color: ink, opacity: 0.08, width: 1 },
        move: { enable: true, speed: 0.35, direction: "none", outModes: { default: "out" } },
      },
      interactivity: {
        detectsOn: "window",
        events: { onHover: { enable: true, mode: "grab" }, resize: { enable: true } },
        modes: { grab: { distance: 170, links: { opacity: 0.45, color: brand } } },
      },
    }),
    [ink, brand]
  );

  if (reduce) return null;

  return (
    <ParticlesProvider init={initEngine}>
      <Particles id="hero-particles" options={options} className="absolute inset-0" />
    </ParticlesProvider>
  );
}
