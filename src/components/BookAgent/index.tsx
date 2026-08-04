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
      width="24"
      height="24"
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

/** Renders assistant text with fenced code blocks and light prose styling. */
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
      nodes.push(
        <p key={i} className={styles.prose}>
          {part}
        </p>,
      );
    }
  });
  return <div className={`${styles.bubble} ${styles.botBubble}`}>{nodes}</div>;
}

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
  const location = useLocation();

  // Track the active page title, refreshing on SPA navigation. The short delay
  // lets Docusaurus/Helmet update document.title before we read it.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = window.setTimeout(() => {
      setCurrentPage(document.title);
      setPageTitle(cleanPageTitle(document.title));
    }, 60);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  // On a chapter page (not the landing/site-root page), offer prompts scoped to it.
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
    // Placeholder assistant bubble that the stream fills in.
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
              <div>
                <div className={styles.headerTitle}>Book Assistant</div>
                <div className={styles.headerSub}>The book, answered · DeepSeek</div>
              </div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Close assistant">
              <CloseIcon />
            </button>
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
                <div key={i} className={styles.row}>
                  <MessageBubble message={m} />
                  {m.role === 'assistant' &&
                    i === messages.length - 1 &&
                    lastAssistantEmpty && (
                      <span className={styles.typing} aria-label="Assistant is typing">
                        ···
                      </span>
                    )}
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
              ↑
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
