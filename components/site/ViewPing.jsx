"use client";
import { useEffect } from "react";
import { API_URL } from "@/lib/api";

// Journal pages are cached, so the server rarely asks the API for them.
// This counts the real visit (the API increments views on GET /blogs/:slug).
export default function ViewPing({ slug }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable — still count the view */
    }
    fetch(`${API_URL}/blogs/${encodeURIComponent(slug)}`, { keepalive: true }).catch(() => {});
  }, [slug]);

  return null;
}
