"use client";
import { useTheme } from "next-themes";
import { useMounted } from "./hooks";

export default function ThemeToggle({ className = "" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = !mounted || resolvedTheme !== "light";
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`group grid size-9 place-items-center rounded-full border border-line text-ink/75 transition-colors duration-300 hover:border-ink/40 hover:text-ink ${className}`}
    >
      <span
        className="relative block size-3.5 overflow-hidden rounded-full border border-current transition-transform duration-700 ease-expo"
        style={{ transform: `rotate(${isDark ? 0 : 180}deg)` }}
      >
        <span className="absolute inset-y-0 left-0 w-1/2 bg-current" />
      </span>
    </button>
  );
}
