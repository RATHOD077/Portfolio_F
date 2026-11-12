"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import LocalTime from "./LocalTime";
import WhatsAppIcon from "./WhatsAppIcon";
import { getLenis } from "./SmoothScroll";
import { EASE } from "./Reveal";
import { NAV, SITE, whatsappLink } from "@/lib/site";

const isActive = (pathname, href) => pathname === href || pathname?.startsWith(`${href}/`);

export default function Navbar({ counts = {} }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 200 && y > prev);
  });

  // Close the menu whenever the page changes (links, browser Back/Forward).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  // While the menu is open: freeze page scroll and close on Escape.
  // The cleanup always restores scrolling, even if the page unmounts mid-open.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.dispatchEvent(new CustomEvent("menu:state", { detail: { open: true } }));
    return () => {
      window.removeEventListener("keydown", onKey);
      window.dispatchEvent(new CustomEvent("menu:state", { detail: { open: false } }));
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <a
        href="#main"
        className="label-mono fixed left-4 top-3 z-[60] -translate-y-20 rounded-full bg-ink px-4 py-2 text-canvas focus:translate-y-0"
      >
        Skip to content
      </a>

      <motion.header
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500 ${
          scrolled || open ? "border-line bg-canvas/85 backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      >
        <div className="container-site flex h-16 items-center justify-between gap-6 md:h-20">
          <Link href="/" onClick={close} className="group flex items-baseline gap-2" aria-label={`${SITE.name} — home`}>
            <span className="font-serif text-[1.65rem] leading-none tracking-tight">
              Sachin <span className="italic">Rathod</span>
            </span>
            <span className="label-mono hidden text-dim transition-colors group-hover:text-brand sm:inline">©26</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {NAV.filter((item) => item.href !== "/contact").map((item) => {
              const active = isActive(pathname, item.href);
              const count = item.countKey ? counts[item.countKey] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative text-[0.95rem] transition-colors duration-300 ${active ? "text-ink" : "text-ink/65 hover:text-ink"}`}
                >
                  {item.label}
                  {count ? <span className="ml-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full border border-line px-1 align-middle font-mono text-[0.55rem] not-italic leading-none text-dim">{count}</span> : null}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-current transition-[width] duration-500 ease-expo ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <LocalTime className="label-mono hidden text-dim lg:inline" />
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              title="Chat on WhatsApp"
              className="grid size-9 place-items-center rounded-full border border-line text-ink/75 transition-colors duration-300 hover:border-brand hover:text-brand"
            >
              <WhatsAppIcon className="size-4" />
            </a>
            <ThemeToggle />
            <Link
              href="/contact"
              className="group hidden items-center gap-2.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-colors duration-300 hover:bg-brand hover:text-brand-ink md:inline-flex"
            >
              <span className="size-1.5 rounded-full bg-brand transition-colors group-hover:bg-brand-ink" />
              Let&apos;s talk
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`relative grid size-9 place-items-center rounded-full border transition-colors duration-300 md:hidden ${
                open ? "border-ink bg-ink text-canvas" : "border-line text-ink"
              }`}
            >
              {/* Two lines that rotate into an ✕ */}
              <span className="relative block h-2.5 w-4">
                <span
                  className={`absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-500 ease-expo ${
                    open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] rounded-full bg-current transition-all duration-500 ease-expo ${
                    open ? "top-1/2 w-full -translate-y-1/2 -rotate-45" : "bottom-0 top-auto w-2/3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu: a compact card that drops down under the header */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              key="menu-backdrop"
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              id="mobile-menu"
              key="mobile-menu"
              role="dialog"
              aria-label="Menu"
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.25, ease: "easeIn" } }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ transformOrigin: "top right" }}
              className="fixed inset-x-3 top-[4.5rem] z-50 overflow-hidden rounded-[22px] border border-line bg-canvas shadow-[0_30px_70px_-25px_rgba(0,0,0,0.6)] md:hidden"
            >
              <motion.nav
                aria-label="Mobile"
                className="p-2"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } } }}
              >
                {[{ label: "Home", href: "/" }, ...NAV].map((item, i) => {
                  const active = item.href === "/" ? pathname === "/" : isActive(pathname, item.href);
                  const count = item.countKey ? counts[item.countKey] : null;
                  return (
                    <motion.div
                      key={item.href}
                      variants={{
                        hidden: { opacity: 0, x: -14 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={active ? "page" : undefined}
                        className={`group flex items-center gap-3 rounded-[14px] px-4 py-3 transition-colors duration-300 ${
                          active ? "bg-surface" : "active:bg-surface"
                        }`}
                      >
                        <span className={`label-mono w-5 ${active ? "text-brand" : "text-dim"}`}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={`flex-1 font-serif text-[1.65rem] leading-none tracking-tight ${active ? "italic" : ""}`}>
                          {item.label}
                          {count ? <span className="ml-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full border border-line px-1 align-middle font-mono text-[0.55rem] not-italic leading-none text-dim">{count}</span> : null}
                        </span>
                        {active ? (
                          <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                        ) : (
                          <span
                            aria-hidden
                            className="text-dim transition-transform duration-500 ease-expo group-active:translate-x-1"
                          >
                            →
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.32, ease: EASE }}
                className="border-t border-line p-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                    className="flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-medium text-brand-ink"
                  >
                    <WhatsAppIcon className="size-4" /> WhatsApp
                  </a>
                  <Link
                    href="/contact"
                    onClick={close}
                    className="flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas"
                  >
                    Let&apos;s talk →
                  </Link>
                </div>
                <div className="label-mono mt-3 flex items-center justify-between gap-3 px-1 text-dim">
                  <a href={`mailto:${SITE.email}`} className="truncate">
                    {SITE.email}
                  </a>
                  <LocalTime prefix="" className="shrink-0" />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
