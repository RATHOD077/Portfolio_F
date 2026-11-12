"use client";
import { useSyncExternalStore } from "react";
import { SITE } from "@/lib/site";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: SITE.timeZone,
  hour: "2-digit",
  minute: "2-digit",
});
const now = () => formatter.format(new Date());
const tick = (onChange) => {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
};

// Current time in Mumbai. The server renders a placeholder; the browser fills it in.
export default function LocalTime({ className = "", prefix = "Mumbai" }) {
  const time = useSyncExternalStore(tick, now, () => null);

  return (
    <span className={className}>
      {prefix ? `${prefix} ` : ""}
      <span className="tabular-nums">{time ?? "--:--"}</span>
      {" IST"}
    </span>
  );
}
