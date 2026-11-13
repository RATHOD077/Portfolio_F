"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import { BRIEF, briefText, estimateBrief, formatRupees } from "@/lib/brief";
import { REPLY_METHODS, whatsappLink } from "@/lib/site";
import { Choice, Field } from "./ContactForm";
import Magnetic from "./Magnetic";
import WhatsAppIcon from "./WhatsAppIcon";
import { EASE } from "./Reveal";

// "Start a project" planner: four short steps → a rough price and timeline →
// the brief lands in the admin inbox (and email), or goes out on WhatsApp.

const STEPS = ["What", "Features", "Timing", "Send"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (value) => value.replace(/\D/g, "");
const needsPhone = (reply) => reply !== "Email";
const short = (amount) => (amount >= 100000 ? `₹${(amount / 100000).toFixed(amount % 100000 ? 1 : 0)}L` : `₹${Math.round(amount / 1000)}k`);

function validate(contact) {
  const errors = {};
  if (!contact.name.trim()) errors.name = "Please tell me your name.";
  if (!EMAIL_RE.test(contact.email.trim())) errors.email = "That email doesn't look right.";
  if (needsPhone(contact.reply) && digits(contact.phone).length < 10) {
    errors.phone = `Please add the number I should ${contact.reply === "WhatsApp" ? "message on WhatsApp" : "call"}.`;
  }
  return errors;
}

function StepButtons({ onBack, onNext, nextLabel = "Next", nextDisabled = false }) {
  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-6">
      {onBack ? (
        <button type="button" onClick={onBack} className="label-mono link-line text-dim hover:text-ink">
          ← Back
        </button>
      ) : (
        <span />
      )}
      {onNext ? (
        <Magnetic strength={0.3}>
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-canvas transition-colors duration-300 hover:bg-brand hover:text-brand-ink disabled:pointer-events-none disabled:opacity-40"
          >
            {nextLabel}
            <span className="transition-transform duration-500 ease-expo group-hover:translate-x-1">→</span>
          </button>
        </Magnetic>
      ) : null}
    </div>
  );
}

function Pill({ selected, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-left text-[0.95rem] transition-colors duration-300 ${
        selected ? "border-brand bg-brand text-brand-ink" : "border-line text-ink/80 hover:border-ink/40 hover:text-ink"
      }`}
    >
      {selected ? <span aria-hidden>✓</span> : null}
      {children}
    </button>
  );
}

function StepTitle({ number, title, italic, text }) {
  return (
    <div className="mb-10">
      <p className="label-mono text-brand">Step {number} of {STEPS.length}</p>
      <h2 className="mt-3 font-serif text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95] tracking-[-0.02em]">
        {title} <span className="italic">{italic}</span>
      </h2>
      {text ? <p className="mt-4 max-w-xl text-lg text-ink/70">{text}</p> : null}
    </div>
  );
}

function EstimateCard({ estimate, brief }) {
  const typeLabel = BRIEF.types.find((t) => t.id === brief.type)?.label;
  if (!BRIEF.showEstimate || !estimate) {
    return (
      <div className="rounded-[4px] border border-line bg-surface p-6 md:p-8">
        <p className="label-mono text-dim">Your brief</p>
        <p className="mt-4 font-serif text-4xl leading-none">{typeLabel}</p>
        <p className="mt-4 text-ink/70">I&apos;ll reply with a price and timeline after reading it.</p>
      </div>
    );
  }
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 md:p-8">
      <p className="label-mono text-dim">Rough estimate</p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={`${estimate.min}-${estimate.max}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-4 font-serif text-[clamp(2.3rem,4.4vw,3.6rem)] leading-none tracking-tight"
        >
          {formatRupees(estimate.min)} <span className="text-dim">–</span> {formatRupees(estimate.max)}
        </motion.p>
      </AnimatePresence>
      <p className="mt-3 text-lg text-ink/80">
        About {estimate.weeksMin}–{estimate.weeksMax} weeks
        {estimate.rush ? <span className="text-brand"> · rush delivery included</span> : null}
      </p>
      <ul className="mt-6 border-t border-line">
        {estimate.lines.map((line) => (
          <li key={line.label} className="flex justify-between gap-4 border-b border-line py-2.5 text-[0.95rem]">
            <span className="text-ink/80">{line.label}</span>
            <span className="label-mono shrink-0 text-dim">
              {short(line.price[0])}–{short(line.price[1])}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm leading-relaxed text-dim">
        A starting point, not a quote. After a short call you get a fixed price and timeline — no obligation.
      </p>
    </div>
  );
}

export default function ProjectPlanner({ initialType = "" }) {
  const startType = BRIEF.types.some((t) => t.id === initialType) ? initialType : "";
  const [step, setStep] = useState(startType ? 1 : 0);
  const [furthest, setFurthest] = useState(startType ? 1 : 0); // furthest step reached (tabs can jump back to it)
  const [direction, setDirection] = useState(1);
  const [brief, setBrief] = useState({ type: startType, features: [], timeline: "", budget: "", details: "" });
  const [contact, setContact] = useState({ name: "", email: "", reply: "WhatsApp", phone: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [slow, setSlow] = useState(false);
  const top = useRef(null);
  const reduceMotion = useReducedMotion();

  const estimate = useMemo(() => estimateBrief(brief), [brief]);
  const typeLabel = BRIEF.types.find((t) => t.id === brief.type)?.label ?? "";

  // The API can take a moment to wake up — say so instead of looking frozen.
  useEffect(() => {
    if (status !== "sending") return;
    const id = setTimeout(() => setSlow(true), 4000);
    return () => {
      clearTimeout(id);
      setSlow(false);
    };
  }, [status]);

  const go = (to) => {
    setDirection(to > step ? 1 : -1);
    setStep(to);
    setFurthest((f) => Math.max(f, to));
    const box = top.current?.getBoundingClientRect();
    if (box && box.top < 0) top.current.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  const setField = (key, value) => setBrief((b) => ({ ...b, [key]: value }));
  const toggleFeature = (id) =>
    setBrief((b) => ({
      ...b,
      features: b.features.includes(id) ? b.features.filter((f) => f !== id) : [...b.features, id],
    }));
  const setContactField = (key) => (e) => {
    const value = typeof e === "string" ? e : e.target.value;
    setContact((c) => ({ ...c, [key]: value }));
    if (errors[key]) setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const fullBrief = () =>
    briefText({ ...brief, reply: contact.reply, phone: needsPhone(contact.reply) ? contact.phone.trim() : "" }, estimate);

  const send = async () => {
    const found = validate(contact);
    setErrors(found);
    const firstInvalid = ["name", "email", "phone"].find((key) => found[key]);
    if (firstInvalid) {
      const el = document.getElementById(`brief-${firstInvalid}`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStatus("sending");
    try {
      await api.post("/contacts", {
        name: contact.name.trim(),
        email: contact.email.trim(),
        subject: `[Project brief] ${typeLabel}${brief.budget ? ` · ${brief.budget}` : ""}`,
        message: fullBrief(),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const whatsappHref = () => {
    const intro = contact.name.trim() ? `Hi Sachin, I'm ${contact.name.trim()}.` : "Hi Sachin,";
    return whatsappLink(`${intro} Here's my project brief:\n\n${fullBrief()}`);
  };

  const slide = {
    enter: (dir) => ({ opacity: 0, x: reduceMotion ? 0 : dir * 48 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: reduceMotion ? 0 : dir * -48 }),
  };

  if (status === "sent") {
    const replyNote = { Email: "by email", WhatsApp: "on WhatsApp", "Phone call": "with a call" }[contact.reply];
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="border-t border-line pt-12"
        role="status"
      >
        <svg viewBox="0 0 52 52" className="size-16 text-brand" fill="none" aria-hidden>
          <motion.circle cx="26" cy="26" r="24" stroke="currentColor" strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: EASE }} />
          <motion.path d="M16 27l7 7 13-15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.6, ease: EASE }} />
        </svg>
        <h2 className="mt-8 font-serif text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.02em]">
          Brief received, <span className="italic">{contact.name.trim().split(" ")[0]}.</span>
        </h2>
        <ol className="mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
          {[
            `I read your brief and reply ${replyNote} — usually within a day.`,
            "We have a short call to fill in the gaps and agree on the scope.",
            "You get a fixed price and timeline. No obligation.",
          ].map((text, i) => (
            <motion.li
              key={text}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + i * 0.12, ease: EASE }}
              className="border-t border-line pt-4"
            >
              <span className="label-mono text-brand">0{i + 1}</span>
              <p className="mt-3 text-lg leading-snug text-ink/80">{text}</p>
            </motion.li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-line px-6 py-3.5 transition-colors duration-300 hover:border-brand hover:text-brand"
          >
            <WhatsAppIcon className="size-4" /> Also send it on WhatsApp
          </a>
          <Link href="/projects" className="label-mono link-line text-ink">
            Meanwhile, see my work →
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div ref={top} className="scroll-mt-28">
      {/* Progress + live estimate */}
      <div className="mb-12 md:mb-16">
        <div className="flex items-end justify-between gap-4">
          <ol className="flex gap-5 md:gap-8" aria-label="Steps">
            {STEPS.map((label, i) => {
              const canJump = i !== step && i <= furthest && Boolean(brief.type);
              return (
                <li key={label}>
                  <button
                    type="button"
                    disabled={!canJump}
                    onClick={() => go(i)}
                    aria-current={i === step ? "step" : undefined}
                    className={`label-mono transition-colors duration-300 ${
                      i === step ? "text-ink" : canJump ? "text-ink/60 hover:text-brand" : "text-dim/60"
                    }`}
                  >
                    <span className={i === step ? "text-brand" : ""}>0{i + 1}</span> {label}
                  </button>
                </li>
              );
            })}
          </ol>
          {BRIEF.showEstimate && estimate && step < 3 ? (
            <p className="label-mono hidden text-dim sm:block" aria-live="polite">
              Estimate <span className="text-ink">{short(estimate.min)}–{short(estimate.max)}</span>
            </p>
          ) : null}
        </div>
        <div className="mt-4 h-px w-full overflow-hidden bg-line">
          <motion.div
            className="h-full origin-left bg-brand"
            animate={{ scaleX: (step + 1) / STEPS.length }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ scaleX: 0 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={step}
          custom={direction}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: EASE }}
        >
          {step === 0 && (
            <>
              <StepTitle number={1} title="What are we" italic="building?" text="Pick the closest match — you can explain the details later." />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BRIEF.types.map((type) => {
                  const selected = brief.type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setField("type", type.id);
                        setTimeout(() => go(1), 260);
                      }}
                      className={`group relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-[4px] border p-5 text-left transition-colors duration-300 md:p-6 ${
                        selected ? "border-brand bg-brand/10" : "border-line hover:border-ink/40"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-serif text-[2rem] leading-none tracking-tight">{type.label}</span>
                        <span
                          className={`grid size-7 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                            selected ? "border-brand bg-brand text-brand-ink" : "border-line text-transparent group-hover:border-ink/40"
                          }`}
                          aria-hidden
                        >
                          ✓
                        </span>
                      </span>
                      <span className="mt-6 block text-[0.95rem] leading-snug text-ink/70">{type.hint}</span>
                      {BRIEF.showEstimate ? (
                        <span className="label-mono mt-3 block text-dim">from {short(type.price[0])}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <StepTitle
                number={2}
                title="What should it"
                italic="do?"
                text={`Tick everything your ${typeLabel.toLowerCase() || "project"} needs. Not sure? Skip it — we'll work it out together.`}
              />
              <div className="flex flex-wrap gap-2.5">
                {BRIEF.features.map((f) => (
                  <Pill key={f.id} selected={brief.features.includes(f.id)} onClick={() => toggleFeature(f.id)}>
                    {f.label}
                  </Pill>
                ))}
              </div>
              <div className="mt-12">
                <Field
                  id="brief-details"
                  label="Anything else? (optional)"
                  textarea
                  rows={3}
                  maxLength={1500}
                  value={brief.details}
                  onChange={(e) => setField("details", e.target.value)}
                  hint="Who it's for, a site you like, a deadline you can't move…"
                />
              </div>
              <StepButtons
                onBack={() => go(0)}
                onNext={() => go(2)}
                nextLabel={brief.features.length ? "Next" : "Skip — no extras"}
              />
            </>
          )}

          {step === 2 && (
            <>
              <StepTitle number={3} title="Timing &" italic="budget" text="Both are optional, but they help me plan the right scope." />
              <div className="space-y-10">
                <Choice
                  legend="When do you need it?"
                  options={BRIEF.timelines.map((t) => t.label)}
                  value={BRIEF.timelines.find((t) => t.id === brief.timeline)?.label ?? ""}
                  onChange={(label) => setField("timeline", BRIEF.timelines.find((t) => t.label === label)?.id ?? "")}
                  allowNone
                />
                <Choice
                  legend="What budget do you have in mind?"
                  options={BRIEF.budgets}
                  value={brief.budget}
                  onChange={(v) => setField("budget", v)}
                  allowNone
                />
              </div>
              <StepButtons onBack={() => go(1)} onNext={() => go(3)} nextLabel="See my estimate" />
            </>
          )}

          {step === 3 && (
            <>
              <StepTitle number={4} title="Your" italic="estimate" text="Happy with it? Send me the brief and I'll get back to you." />
              <div className="grid gap-12 md:grid-cols-12 md:gap-10">
                <div className="md:col-span-5">
                  <EstimateCard estimate={estimate} brief={brief} />
                </div>
                <div className="space-y-9 md:col-span-7">
                  <Choice
                    legend="How should I get back to you?"
                    options={REPLY_METHODS}
                    value={contact.reply}
                    onChange={setContactField("reply")}
                  />
                  <div className="grid gap-9 md:grid-cols-2 md:gap-8">
                    <Field id="brief-name" label="Your name" autoComplete="name" value={contact.name} onChange={setContactField("name")} error={errors.name} />
                    <Field id="brief-email" label="Email" type="email" autoComplete="email" value={contact.email} onChange={setContactField("email")} error={errors.email} />
                  </div>
                  <AnimatePresence initial={false}>
                    {needsPhone(contact.reply) && (
                      <motion.div
                        key="phone"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <Field
                          id="brief-phone"
                          label={contact.reply === "WhatsApp" ? "Your WhatsApp number" : "Your phone number"}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={contact.phone}
                          onChange={setContactField("phone")}
                          error={errors.phone}
                          hint="Include your country code, e.g. +91 98765 43210"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => go(2)} className="label-mono link-line self-start text-dim hover:text-ink sm:self-auto">
                      ← Back
                    </button>
                    <Magnetic strength={0.3}>
                      <button
                        type="button"
                        onClick={send}
                        disabled={status === "sending"}
                        className="group inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 text-base font-medium text-brand-ink transition-transform duration-500 ease-expo hover:scale-[1.03] disabled:opacity-60"
                      >
                        {status === "sending" ? "Sending…" : "Send my brief"}
                        <span className="transition-transform duration-500 ease-expo group-hover:translate-x-1">→</span>
                      </button>
                    </Magnetic>
                  </div>
                  <p className="text-sm text-dim" aria-live="polite">
                    {status === "error" ? (
                      <span className="text-brand">Couldn&apos;t send right now — use WhatsApp below instead.</span>
                    ) : slow ? (
                      "Waking up the server — this can take a few seconds…"
                    ) : (
                      "Free, no obligation. I usually reply within a day."
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-6">
                    <span className="text-sm text-dim">Prefer chatting?</span>
                    <a
                      href={whatsappHref()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 rounded-full border border-line px-5 py-2.5 text-[0.95rem] transition-colors duration-300 hover:border-brand hover:text-brand"
                    >
                      <WhatsAppIcon className="size-4" />
                      Send the brief on WhatsApp
                      <span className="transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
