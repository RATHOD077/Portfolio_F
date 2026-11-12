"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, PenLine, Phone, Sparkles, X } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { EASE } from "./Reveal";
import { SITE, whatsappLink } from "@/lib/site";

const HINT_KEY = "contact-dock-hint-seen";

// One floating "Let's talk" button that opens every way to reach Sachin:
// WhatsApp, call, email, the contact form, or the AI assistant.
export default function ContactDock() {
  const pathname = usePathname();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hide while the AI assistant window (same corner) or the mobile menu is open.
  useEffect(() => {
    const onChat = (e) => setChatOpen(Boolean(e.detail?.open));
    const onMenu = (e) => setMenuOpen(Boolean(e.detail?.open));
    window.addEventListener("assistant:state", onChat);
    window.addEventListener("menu:state", onMenu);
    return () => {
      window.removeEventListener("assistant:state", onChat);
      window.removeEventListener("menu:state", onMenu);
    };
  }, []);

  // A one-time nudge per visit, a few seconds after the page loads.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(HINT_KEY) === "1";
    } catch {
      /* storage blocked — just show it */
    }
    if (seen) return;
    const show = setTimeout(() => {
      setHint(true);
      try {
        sessionStorage.setItem(HINT_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 6000);
    const hide = setTimeout(() => setHint(false), 14000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // Close with Escape or a click outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const toggle = () => {
    setHint(false);
    setOpen((v) => !v);
  };
  const close = () => setOpen(false);

  const openAssistant = () => {
    close();
    window.dispatchEvent(new CustomEvent("assistant:open"));
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  const items = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      sub: "Chat with me now",
      href: whatsappLink(),
      external: true,
      icon: <WhatsAppIcon className="size-[18px]" />,
      accent: true,
    },
    { key: "call", label: "Call", sub: SITE.phone, href: SITE.phoneHref, icon: <Phone size={17} strokeWidth={1.6} /> },
    { key: "email", label: "Email", sub: SITE.email, href: `mailto:${SITE.email}`, icon: <Mail size={17} strokeWidth={1.6} />, copy: true },
    { key: "form", label: "Contact form", sub: "Tell me about your project", to: "/contact#contact-form", icon: <PenLine size={17} strokeWidth={1.6} /> },
    { key: "ai", label: "Ask AI", sub: "Quick questions about my work", action: openAssistant, icon: <Sparkles size={17} strokeWidth={1.6} /> },
  ];

  // The contact page already lists every channel, and the dock would cover its
  // "Send message" button.
  if (pathname === "/contact") return null;

  const rowClass =
    "group flex min-w-0 flex-1 items-center gap-3.5 rounded-[10px] px-3 py-2.5 text-left transition-colors duration-300 hover:bg-surface focus-visible:bg-surface";

  const rowInner = (item) => (
    <>
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full border transition-transform duration-500 ease-expo group-hover:scale-110 ${
          item.accent ? "border-brand bg-brand text-brand-ink" : "border-line text-ink/80"
        }`}
      >
        {item.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.95rem] font-medium leading-tight">{item.label}</span>
        <span className="block truncate text-[0.8rem] text-dim">{item.sub}</span>
      </span>
      <span className="shrink-0 text-dim transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink">
        {item.to ? "→" : "↗"}
      </span>
    </>
  );

  return (
    <div
      ref={ref}
      className={`fixed bottom-5 right-5 z-[90] transition-opacity duration-300 md:bottom-6 md:right-6 ${
        chatOpen || menuOpen ? "pointer-events-none opacity-0" : ""
      }`}
    >
      <AnimatePresence>
        {hint && !open && (
          <motion.button
            key="hint"
            type="button"
            onClick={toggle}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute bottom-[calc(100%+12px)] right-0 w-64 rounded-2xl rounded-br-md border border-line bg-canvas p-4 text-left text-sm leading-snug shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]"
          >
            <span className="label-mono mb-1.5 flex items-center gap-1.5 text-brand">
              <WhatsAppIcon className="size-3" /> Hi there
            </span>
            Need a website or an app? Chat with me on WhatsApp, or pick another way to reach me.
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            id="contact-dock"
            role="dialog"
            aria-label="Ways to contact Sachin"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ transformOrigin: "bottom right" }}
            className="absolute bottom-[calc(100%+12px)] right-0 w-[min(340px,calc(100vw-2.5rem))] overflow-hidden rounded-[16px] border border-line bg-canvas shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="font-serif text-2xl leading-none">
                  Let&apos;s <span className="italic">talk</span>
                </p>
                <p className="label-mono mt-1.5 text-[0.6rem] text-dim">Pick whatever is easiest for you</p>
              </div>
              <span className="label-mono flex items-center gap-1.5 text-[0.6rem] text-dim">
                <span className="relative flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative size-1.5 rounded-full bg-brand" />
                </span>
                Available
              </span>
            </div>

            <motion.ul
              className="p-2"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
            >
              {items.map((item) => (
                <motion.li
                  key={item.key}
                  className="flex items-center gap-1"
                  variants={{
                    hidden: { opacity: 0, x: 18 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
                  }}
                >
                  {item.action ? (
                    <button type="button" onClick={item.action} className={rowClass}>
                      {rowInner(item)}
                    </button>
                  ) : item.to ? (
                    <Link href={item.to} onClick={close} className={rowClass}>
                      {rowInner(item)}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={close}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={rowClass}
                    >
                      {rowInner(item)}
                    </a>
                  )}
                  {item.copy ? (
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="label-mono mr-1 shrink-0 rounded-full border border-line px-2.5 py-1.5 text-[0.6rem] text-dim transition-colors hover:text-ink"
                      aria-live="polite"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  ) : null}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="contact-dock"
        aria-label={open ? "Close contact options" : "Contact options"}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2, ease: EASE }}
        className="group ml-auto flex items-center gap-2.5 rounded-full border border-line bg-ink py-2 pl-2 pr-5 text-sm font-medium text-canvas shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:bg-brand hover:text-brand-ink"
      >
        <span className="relative grid size-8 place-items-center rounded-full bg-brand text-brand-ink transition-colors duration-300 group-hover:bg-brand-ink group-hover:text-brand">
          {!open && <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-30" />}
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <X size={15} strokeWidth={2} />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <WhatsAppIcon className="size-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {open ? "Close" : "Let's talk"}
      </motion.button>
    </div>
  );
}
