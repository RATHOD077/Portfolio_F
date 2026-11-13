"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "@/lib/api";
import { PROJECT_TYPES, REPLY_METHODS, SITE, whatsappLink } from "@/lib/site";
import Magnetic from "./Magnetic";
import WhatsAppIcon from "./WhatsAppIcon";
import { EASE } from "./Reveal";

const EMPTY = { type: "", reply: "Email", name: "", email: "", phone: "", subject: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const needsPhone = (reply) => reply !== "Email";
const digits = (value) => value.replace(/\D/g, "");

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please tell me your name.";
  if (!EMAIL_RE.test(values.email.trim())) errors.email = "That email doesn't look right.";
  if (needsPhone(values.reply) && digits(values.phone).length < 10) {
    errors.phone = `Please add the number I should ${values.reply === "WhatsApp" ? "message on WhatsApp" : "call"}.`;
  }
  if (values.message.trim().length < 10) errors.message = "A few more words, please (10+ characters).";
  return errors;
}

// The contacts API only stores name, email, subject and message, so the
// preferred reply method and phone number go at the top of the message.
function composeMessage(values) {
  const lines = [];
  if (needsPhone(values.reply)) lines.push(`Preferred reply: ${values.reply} — ${values.phone.trim()}`);
  else lines.push("Preferred reply: Email");
  return `${lines.join("\n")}\n\n${values.message.trim()}`;
}

function composeWhatsApp(values) {
  const intro = values.name.trim() ? `Hi Sachin, I'm ${values.name.trim()}.` : "Hi Sachin,";
  const about = values.type ? ` I need a ${values.type.toLowerCase()}.` : "";
  const subject = values.subject.trim() ? `\n\n${values.subject.trim()}` : "";
  return `${intro}${about}${subject}\n\n${values.message.trim()}`;
}

// Which required fields are filled in correctly — drives the progress bar.
function progress(values) {
  const checks = [
    values.name.trim().length > 0,
    EMAIL_RE.test(values.email.trim()),
    values.message.trim().length >= 10,
  ];
  if (needsPhone(values.reply)) checks.splice(2, 0, digits(values.phone).length >= 10);
  return { done: checks.filter(Boolean).length, total: checks.length };
}

export function Field({ id, label, error, hint, textarea = false, ...props }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className="relative">
      <Tag
        id={id}
        name={id}
        placeholder=" "
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`peer w-full resize-none border-0 border-b bg-transparent px-0 pb-3 pt-7 text-xl outline-none transition-colors duration-300 placeholder:text-transparent focus:border-ink focus-visible:outline-none md:text-2xl ${
          error ? "border-brand" : "border-line"
        }`}
        {...props}
      />
      <label
        htmlFor={id}
        className="label-mono pointer-events-none absolute left-0 top-8 text-dim transition-all duration-300 ease-expo peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0"
      >
        {label}
      </label>
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, x: [0, -6, 6, -3, 3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-2 text-sm text-brand"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-sm text-dim">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Choice({ legend, options, value, onChange, allowNone = false }) {
  return (
    <fieldset>
      <legend className="label-mono mb-4 text-dim">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected && allowNone ? "" : option)}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.95rem] transition-colors duration-300 ${
                selected
                  ? "border-brand bg-brand text-brand-ink"
                  : "border-line text-ink/80 hover:border-ink/40 hover:text-ink"
              }`}
            >
              {option === "WhatsApp" ? <WhatsAppIcon className="size-3.5" /> : null}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [slow, setSlow] = useState(false);

  // The API can take a moment to wake up — say so instead of looking frozen.
  useEffect(() => {
    if (status !== "sending") return;
    const id = setTimeout(() => setSlow(true), 4000);
    return () => {
      clearTimeout(id);
      setSlow(false);
    };
  }, [status]);

  const set = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((errs) => ({ ...errs, [key]: undefined }));
  };
  const update = (key) => (e) => set(key, e.target.value);

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = ["name", "email", "phone", "message"].find((key) => found[key]);
    if (firstInvalid) {
      // Take the visitor straight to the field that needs attention.
      const el = document.getElementById(firstInvalid);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setStatus("sending");
    // The project type travels in the subject line, e.g. "[Mobile app] Booking app for my salon".
    const subject = values.subject.trim() || "Project enquiry";
    try {
      await api.post("/contacts", {
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.type ? `[${values.type}] ${subject}` : subject,
        message: composeMessage(values),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  // Skip the form and continue the conversation in WhatsApp.
  const sendOnWhatsApp = () => {
    if (values.message.trim().length < 10) {
      setErrors((errs) => ({ ...errs, message: "Write a short message first (10+ characters)." }));
      return;
    }
    window.open(whatsappLink(composeWhatsApp(values)), "_blank", "noopener,noreferrer");
  };

  const { done, total } = progress(values);
  const messageLength = values.message.trim().length;

  const replyNote = {
    Email: "I'll reply by email",
    WhatsApp: "I'll message you on WhatsApp",
    "Phone call": "I'll give you a call",
  }[values.reply];

  return (
    <AnimatePresence mode="wait">
      {status === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="border-t border-line pt-10"
          role="status"
        >
          <svg viewBox="0 0 52 52" className="size-14 text-brand" fill="none" aria-hidden>
            <motion.circle
              cx="26" cy="26" r="24" stroke="currentColor" strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: EASE }}
            />
            <motion.path
              d="M16 27l7 7 13-15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
            />
          </svg>
          <h3 className="mt-6 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-none">
            Thanks{values.name ? `, ${values.name.trim().split(" ")[0]}` : ""}.
          </h3>
          <p className="mt-4 max-w-md text-lg text-ink/75">
            Your message is in my inbox. {replyNote}, usually within a day.
          </p>
          <button
            type="button"
            onClick={() => {
              setValues(EMPTY);
              setStatus("idle");
            }}
            className="label-mono link-line mt-8 text-ink"
          >
            Send another message
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          id="contact-form"
          noValidate
          onSubmit={submit}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4 }}
          className="scroll-mt-28 space-y-9"
        >
          <Choice
            legend="What do you need?"
            options={PROJECT_TYPES}
            value={values.type}
            onChange={(v) => set("type", v)}
            allowNone
          />
          <Choice
            legend="How should I get back to you?"
            options={REPLY_METHODS}
            value={values.reply}
            onChange={(v) => set("reply", v)}
          />

          <div className="grid gap-9 md:grid-cols-2 md:gap-8">
            <Field id="name" label="Your name" autoComplete="name" value={values.name} onChange={update("name")} error={errors.name} />
            <Field id="email" label="Email" type="email" autoComplete="email" value={values.email} onChange={update("email")} error={errors.email} />
          </div>

          <AnimatePresence initial={false}>
            {needsPhone(values.reply) && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="overflow-hidden"
              >
                <Field
                  id="phone"
                  label={values.reply === "WhatsApp" ? "Your WhatsApp number (with country code)" : "Your phone number"}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={update("phone")}
                  error={errors.phone}
                  hint="Include your country code, e.g. +91 98765 43210"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Field id="subject" label="Subject (optional)" value={values.subject} onChange={update("subject")} />
          <Field
            id="message"
            label="Tell me about your project"
            textarea
            rows={5}
            value={values.message}
            onChange={update("message")}
            error={errors.message}
            hint={
              messageLength === 0
                ? "What are you building, who is it for, and when do you need it?"
                : messageLength < 10
                  ? `${10 - messageLength} more characters to go`
                  : `✓ ${messageLength} characters — looks good`
            }
          />

          {/* How much of the form is done */}
          <div aria-live="polite">
            <div className="label-mono mb-2 flex justify-between text-dim">
              <span>{done === total ? "Ready to send" : "Almost there"}</span>
              <span>
                {done} of {total} done
              </span>
            </div>
            <div className="h-px w-full overflow-hidden bg-line">
              <motion.div
                className="h-full origin-left bg-brand"
                animate={{ scaleX: done / total }}
                transition={{ duration: 0.6, ease: EASE }}
                style={{ scaleX: 0 }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xs text-sm text-dim" aria-live="polite">
              {status === "error" ? (
                <span className="text-brand">
                  Couldn&apos;t send right now. Try WhatsApp below, or email{" "}
                  <a className="underline" href={`mailto:${SITE.email}`}>
                    {SITE.email}
                  </a>
                  .
                </span>
              ) : slow ? (
                "Waking up the server — this can take a few seconds…"
              ) : (
                `${replyNote}, usually within a day.`
              )}
            </p>
            <Magnetic strength={0.3}>
              <button
                type="submit"
                disabled={status === "sending"}
                className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-base font-medium text-canvas transition-colors duration-300 hover:bg-brand hover:text-brand-ink disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send message"}
                <span className="transition-transform duration-500 ease-expo group-hover:translate-x-1">→</span>
              </button>
            </Magnetic>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-6">
            <span className="text-sm text-dim">Prefer chatting?</span>
            <button
              type="button"
              onClick={sendOnWhatsApp}
              className="group inline-flex items-center gap-2.5 rounded-full border border-line px-5 py-2.5 text-[0.95rem] transition-colors duration-300 hover:border-brand hover:text-brand"
            >
              <WhatsAppIcon className="size-4" />
              Send this on WhatsApp instead
              <span className="transition-transform duration-500 ease-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
