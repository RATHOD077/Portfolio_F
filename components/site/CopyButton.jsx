"use client";
import { useState } from "react";

export default function CopyButton({ value, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the value is still visible to copy by hand */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`label-mono rounded-full border border-line px-3 py-1.5 text-dim transition-colors hover:border-ink/40 hover:text-ink ${className}`}
      aria-live="polite"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
