"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '@/lib/api';

const EASE = [0.16, 1, 0.3, 1];

const GREETING =
  "Hi — I'm an AI assistant that knows Sachin's portfolio. Ask me about his projects, his stack, or how this site was built.";

const SUGGESTIONS = [
  'Tell me about his projects',
  "What's his tech stack?",
  'How was this site built?',
  'How does the backend work?',
];

// Renders **bold** segments and line breaks from the model's reply.
const MessageText = ({ text }) => {
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <span key={i}>
      {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={j} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      )}
      {i < lines.length - 1 && <br />}
    </span>
  ));
};

const ChatMessage = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[0.92rem] leading-relaxed ${
          isUser ? 'rounded-br-md bg-ink text-canvas' : 'rounded-bl-md bg-surface text-ink'
        }`}
      >
        <MessageText text={msg.content} />
      </div>
      <span className="label-mono mt-1.5 px-1 text-[0.6rem] text-dim">
        {isUser ? 'You' : 'Assistant'} ·{' '}
        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </motion.div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 self-start rounded-2xl rounded-bl-md bg-surface px-4 py-3.5" aria-label="Assistant is typing">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="size-1.5 rounded-full bg-dim"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
      />
    ))}
  </div>
);

// Other parts of the site can open the assistant with:
//   window.dispatchEvent(new CustomEvent('assistant:open'))
// and it announces open/close as 'assistant:state' events ({ detail: { open } }).
export default function PortfolioChatbot({ showLauncher = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [{ role: 'assistant', content: GREETING, timestamp: Date.now() }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const open = () => {
      setIsOpen(true);
      setUnread(0);
    };
    window.addEventListener('assistant:open', open);
    return () => window.removeEventListener('assistant:open', open);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('assistant:state', { detail: { open: isOpen } }));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(() => inputRef.current?.focus(), 300);
    const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text) => {
      const userText = (text || input).trim();
      if (!userText || isLoading) return;

      setMessages((prev) => [...prev, { role: 'user', content: userText, timestamp: Date.now() }]);
      setInput('');
      setIsLoading(true);
      setShowSuggestions(false);

      try {
        const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText, history }),
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        const botReply = data?.data?.reply || "I couldn't come up with an answer. Please try again.";
        setMessages((prev) => [...prev, { role: 'assistant', content: botReply, timestamp: Date.now() }]);
        if (!isOpen) setUnread((n) => n + 1);
      } catch (err) {
        console.error('Chatbot error:', err);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "Sorry — I couldn't reach the AI service. The server may be waking up; please try again in a few seconds.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, isOpen]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: GREETING, timestamp: Date.now() }]);
    setShowSuggestions(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] md:bottom-6 md:right-6">
      <AnimatePresence>
        {showLauncher && !isOpen && (
          <motion.button
            key="launcher"
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={() => {
              setIsOpen(true);
              setUnread(0);
            }}
            aria-label="Open the AI assistant"
            className="group relative flex items-center gap-2.5 rounded-full border border-line bg-ink py-3 pl-4 pr-5 text-sm font-medium text-canvas shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:bg-brand hover:text-brand-ink"
          >
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-60 group-hover:bg-brand-ink" />
              <span className="relative size-2 rounded-full bg-brand group-hover:bg-brand-ink" />
            </span>
            Ask AI
            {unread > 0 && (
              <span className="label-mono absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-brand text-[0.6rem] text-brand-ink">
                {unread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="window"
            role="dialog"
            aria-label="AI assistant"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed bottom-5 right-5 flex h-[min(580px,calc(100svh-6rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[14px] border border-line bg-canvas text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] md:bottom-6 md:right-6"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="font-serif text-xl leading-none">
                  Ask about <span className="italic">my work</span>
                </p>
                <p className="label-mono mt-1.5 text-[0.6rem] text-dim">AI assistant · answers can be wrong</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={clearChat}
                  className="label-mono rounded-full border border-line px-2.5 py-1 text-[0.6rem] text-dim transition-colors hover:text-ink"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close the assistant"
                  className="grid size-7 place-items-center rounded-full border border-line text-dim transition-colors hover:text-ink"
                >
                  ✕
                </button>
              </div>
            </div>

            <div data-lenis-prevent className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-5">
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} />
              ))}
              {isLoading && <TypingIndicator />}

              {showSuggestions && messages.length === 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-1 flex flex-wrap gap-2"
                >
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage(s)}
                      className="rounded-full border border-line px-3 py-1.5 text-left text-[0.8rem] text-ink/80 transition-colors hover:border-brand hover:text-brand"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-line p-3">
              <div className="flex items-end gap-2 rounded-xl border border-line bg-surface/60 px-3 py-2 transition-colors focus-within:border-ink/40">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question…"
                  rows={1}
                  disabled={isLoading}
                  aria-label="Your question"
                  className="max-h-24 flex-1 resize-none bg-transparent py-1.5 text-[0.92rem] text-ink outline-none placeholder:text-dim disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-brand-ink transition-opacity disabled:opacity-30"
                >
                  {isLoading ? '…' : '↑'}
                </button>
              </div>
              <p className="label-mono mt-2 text-center text-[0.58rem] text-dim">Enter to send · Shift+Enter for a new line</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
