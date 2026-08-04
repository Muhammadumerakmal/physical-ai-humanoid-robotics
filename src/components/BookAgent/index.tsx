import {useEffect, useRef, useState, type KeyboardEvent, type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './BookAgent.module.css';

type Message = {role: 'user' | 'assistant'; content: string};

const SUGGESTIONS = [
  'What is the difference between physical AI and digital AI?',
  'How does a biped robot keep its balance?',
  'Explain the Zero-Moment Point in simple terms',
  'What is sim-to-real transfer and why is it needed?',
];

const SITE_TITLE = 'Physical AI and Humanoid Robotics';

/** Strip the "| Site" suffix Docusaurus appends to produce a clean chapter name. */
function cleanPageTitle(docTitle: string): string {
  return docTitle.split('|')[0].trim();
}

/**
 * The agent endpoint is resolved as:
 *  - `customFields.agentEndpoint` if set (e.g. AGENT_ENDPOINT at build time)
 *  - the local agent proxy in development
 *  - a same-origin `/api/agent` in production (deploy the agent as a
 *    serverless function / reverse-proxy route on your static host)
 */
function resolveEndpoint(agentEndpoint?: string): string {
  if (agentEndpoint) return agentEndpoint;
  return process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8787/api/agent'
    : '/api/agent';
}

/* ------------------------------- icons --------------------------------- */

function RobotIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <rect x="4" y="7" width="16" height="11" rx="2.5" />
      <line x1="9" y1="4" x2="9" y2="7" />
      <line x1="15" y1="4" x2="15" y2="7" />
      <circle cx="9.2" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <line x1="4" y1="12.6" x2="2.1" y2="12.6" />
      <line x1="20" y1="12.6" x2="21.9" y2="12.6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/* --------------------------- markup helpers ---------------------------- */

type InlineSpan =
  | {type: 'text'; value: string}
  | {type: 'bold'; value: string}
  | {type: 'code'; value: string};

/** Split raw assistant text into paragraphs, then inline code/bold spans. */
function inlineSpans(text: string): InlineSpan[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts
    .map((part): InlineSpan | null => {
      if (!part) return null;
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return {type: 'code', value: part.slice(1, -1)};
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return {type: 'bold', value: part.slice(2, -2)};
      }
      return {type: 'text', value: part};
    })
    .filter((p): p is InlineSpan => p !== null);
}

function renderInline(text: string) {
  return inlineSpans(text).map((span, i) => {
    if (span.type === 'code') {
      return (
        <code key={i} className={styles.inlineCode}>
          {span.value}
        </code>
      );
    }
    if (span.type === 'bold') {
      return (
        <strong key={i} className={styles.bold}>
          {span.value}
        </strong>
      );
    }
    return <span key={i}>{span.value}</span>;
  });
}

/** Renders assistant text with code blocks and light prose styling. */
function MessageBubble({message}: {message: Message}) {
  if (message.role === 'user') {
    return <div className={`${styles.bubble} ${styles.userBubble}`}>{message.content}</div>;
  }

  const parts = message.content.split(/```([\s\S]*?)```/g);
  const nodes: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      nodes.push(
        <pre key={i} className={styles.codeBlock}>
          <code>{part}</code>
        </pre>,
      );
    } else if (part.trim()) {
      part.split(/\n{2,}/).forEach((para, j) => {
        if (para.trim()) {
          nodes.push(
            <p key={`${i}-${j}`} className={styles.prose}>
              {renderInline(para.trim())}
            </p>,
          );
        }
      });
    }
  });
  return <div className={`${styles.bubble} ${styles.botBubble}`}>{nodes}</div>;
}

/* -------------------------- typing indicator --------------------------- */

function TypingBubbles() {
  return (
    <span className={styles.typing} role="status" aria-label="Assistant is typing">
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
    </span>
  );
}

/* ------------------------------- component ----------------------------- */

export default function BookAgent() {
  const {siteConfig} = useDocusaurusContext();
  const endpoint = resolveEndpoint(
    siteConfig.customFields?.agentEndpoint as string | undefined,
  );

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  // Track the active page title, refreshing on SPA navigation.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = window.setTimeout(() => {
      setCurrentPage(document.title);
      setPageTitle(cleanPageTitle(document.title));
    }, 60);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  // Keep the input autosized.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const onChapter = Boolean(pageTitle) && !pageTitle.startsWith(SITE_TITLE);
  const pageActions = onChapter
    ? [
        `Explain "${pageTitle}" in simple terms`,
        `Quiz me with 3 questions on "${pageTitle}"`,
        `Give me a real-world example from this chapter`,
      ]
    : [];

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, busy, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) {
      return;
    }
    setInput('');
    setError(null);
    const history: Message[] = [...messages, {role: 'user', content}];
    setMessages([...history, {role: 'assistant', content: ''}]);
    setBusy(true);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({messages: history, stream: true, currentPage}),
      });

      if (!res.ok || !res.body) {
        let detail = `Request failed (HTTP ${res.status})`;
        try {
          const json = await res.json();
          if (json?.error) {
            detail = String(json.error);
          }
        } catch {
          // Non-JSON error body — keep the generic message.
        }
        throw new Error(detail);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      for (;;) {
        const {done, value} = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, {stream: true});
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const data = line.trim();
          if (!data.startsWith('data:')) {
            continue;
          }
          const payload = data.slice(5).trim();
          if (!payload || payload === '[DONE]') {
            continue;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (typeof delta === 'string' && delta.length > 0) {
              full += delta;
              setMessages((prev) => {
                const next = prev.slice();
                next[next.length - 1] = {role: 'assistant', content: full};
                return next;
              });
            }
          } catch {
            // Ignore partial / non-JSON chunk lines.
          }
        }
      }

      if (!full) {
        setMessages((prev) => prev.slice(0, -1));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  function clearChat() {
    setMessages([]);
    setError(null);
    if (inputRef.current) inputRef.current.focus();
  }

  const lastAssistantEmpty =
    busy &&
    messages[messages.length - 1]?.role === 'assistant' &&
    messages[messages.length - 1].content === '';

  return (
    <div className={styles.wrapper}>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Book assistant">
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerIcon}>
                <RobotIcon />
              </span>
              <div className={styles.headerText}>
                <div className={styles.headerTitle}>
                  Book Assistant
                  <span className={styles.statusDot} aria-label="Online" />
                </div>
                <div className={styles.headerSub}>Grounded in the book · RAG</div>
              </div>
            </div>
            <div className={styles.headerActions}>
              {messages.length > 0 && (
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={clearChat}
                  aria-label="Clear conversation">
                  <TrashIcon />
                </button>
              )}
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setOpen(false)}
                aria-label="Close assistant">
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className={styles.messages} ref={listRef}>
            {messages.length === 0 ? (
              <div className={styles.greeting}>
                <p>
                  Hi — I'm the companion assistant for{' '}
                  <em>Physical AI and Humanoid Robotics</em>. Ask me about any
                  concept, equation, or chapter in the book.
                </p>
                {onChapter && (
                  <>
                    <div className={styles.suggestLabel}>
                      About this page — <strong>{pageTitle}</strong>
                    </div>
                    <div className={styles.suggestions}>
                      {pageActions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`${styles.chip} ${styles.chipPage}`}
                          onClick={() => void send(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <div className={styles.suggestLabel}>Or explore the book</div>
                <div className={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={styles.chip}
                      onClick={() => void send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`${styles.row} ${m.role === 'assistant' ? styles.botRow : ''}`}>
                  {m.role === 'assistant' && (
                    <span className={styles.avatar} aria-hidden="true">
                      <RobotIcon />
                    </span>
                  )}
                  <MessageBubble message={m} />
                  {m.role === 'assistant' &&
                    i === messages.length - 1 &&
                    lastAssistantEmpty && <TypingBubbles />}
                </div>
              ))
            )}
          </div>

          {error && (
            <div className={styles.errorBar}>
              <span>{error}</span>
              {endpoint.includes('127.0.0.1') && (
                <>
                  {' '}
                  Tip: run <code>npm run agent</code> in another terminal.
                </>
              )}
            </div>
          )}

          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about the book…"
              rows={1}
              disabled={busy}
              aria-label="Ask the book assistant a question"
            />
            <button
              type="button"
              className={styles.sendBtn}
              onClick={() => void send(input)}
              disabled={busy || !input.trim()}
              aria-label="Send message">
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close book assistant' : 'Open book assistant'}
        aria-expanded={open}>
        {open ? <CloseIcon /> : <RobotIcon />}
      </button>
    </div>
  );
}