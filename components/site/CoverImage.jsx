"use client";
import { useState } from "react";
import Media from "./Media";
import ParallaxMedia from "./ParallaxMedia";

// Wide cover image that removes itself (and its frame) if the image can't load.
export default function CoverImage({ src, alt, className = "aspect-[16/9]" }) {
  const [ok, setOk] = useState(Boolean(src));
  if (!ok) return null;
  return (
    <div className="container-site mt-12 md:mt-16">
      <ParallaxMedia className={`rounded-[4px] ${className}`} amount={8}>
        <Media src={src} alt={alt} priority sizes="(min-width: 1480px) 1400px, 100vw" onFail={() => setOk(false)} />
      </ParallaxMedia>
    </div>
  );
}
