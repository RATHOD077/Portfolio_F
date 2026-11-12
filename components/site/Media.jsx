"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Hosts listed in next.config.js images.remotePatterns get resized/compressed by Next.
const OPTIMIZABLE = /^https:\/\/(sachin-dev-59j2\.onrender\.com\/uploads\/|res\.cloudinary\.com\/|images\.unsplash\.com\/)/;

/**
 * Fills its (positioned) parent with an image. If the image is missing or fails
 * to load, shows a typographic poster instead — or calls onFail so the parent
 * can hide itself.
 */
export default function Media({
  src,
  alt = "",
  title,
  label = "Preview unavailable",
  sizes = "100vw",
  priority = false,
  className = "",
  onFail,
}) {
  const ref = useRef(null);
  // "optimized" → resized by Next; "raw" → straight from the source; "failed" → poster.
  // If the optimizer times out (e.g. the API server is still waking up), retry the raw URL.
  const [stage, setStage] = useState(() => (!src ? "failed" : OPTIMIZABLE.test(src) ? "optimized" : "raw"));

  const fail = () => {
    if (stage === "optimized") {
      setStage("raw");
      return;
    }
    setStage("failed");
    onFail?.();
  };

  // An image that errored before React hydrated never fires onError — catch that here.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) fail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (stage === "failed") return onFail ? null : <Poster title={title || alt} label={label} />;

  return (
    <Image
      key={stage}
      ref={ref}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={stage === "raw"}
      onError={fail}
      className={`object-cover ${className}`}
    />
  );
}

export function Poster({ title, label }) {
  return (
    <div className="media-poster absolute inset-0 flex flex-col justify-between p-5 md:p-7">
      <span className="label-mono text-dim">{label || " "}</span>
      {title ? (
        <span className="max-w-[16ch] font-serif text-[clamp(1.8rem,4vw,4rem)] italic leading-[0.95] tracking-tight text-ink/70">
          {title}
        </span>
      ) : null}
    </div>
  );
}
