import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './BookAgent.module.css';

type Message = {role: 'user' | 'assistant'; content: string};

const SUGGESTIONS = [
  'What makes an agent different from a chatbot?',
  'Explain the ReAct loop',
  'What is the Model Context Protocol (MCP)?',
  'How do I evaluate an agent?',
];

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
      strokeLinejoin="round"
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

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Markdown-lite rendering (bold, inline code, links) — no deps        */
/* ------------------------------------------------------------------ */
const INLINE_RE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let counter = 0;
  INLINE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(
        <span key={`${keyBase}-t${counter++}`}>{text.slice(last, match.index)}</span>,
      );
    }
    if (match[1]) {
      nodes.push(<code key={`${keyBase}-c${counter++}`}>{match[1].slice(1, -1)}</code>);
    } else if (match[2]) {
      nodes.push(
        <strong key={`${keyBase}-b${counter++}`}>{match[2].slice(2, -2)}</strong>,
      );
    } else if (match[3]) {
      const close = match[3].indexOf('](');
      const label = match[3].slice(1, close);
      const href = match[3].slice(close + 2, -1);
      nodes.push(
        <a key={`${keyBase}-a${counter++}`} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>,
      );
    }
    last = INLINE_RE.lastIndex;
  }
  if (last < text.length) {
    nodes.push(<span key={`${keyBase}-t${counter++}`}>{text.slice(last)}</span>);
  }
  return nodes;
}

function MessageBubble({message}: {message: Message}) {
  if (message.role === 'user') {
    return <div className={`${styles.bubble} ${styles.userBubble}`}>{message.content}</div>;
  }

  const parts = message.content.split(/```([\s\S]*?)```/g);
  const nodes: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      // Drop an optional leading language tag (first line) from fenced blocks.
      const body = part.replace(/^[^\n]*\n/, '');
      nodes.push(
        <pre key={i} className={styles.codeBlock}>
          <code>{body}</code>
        </pre>,
      );
    } else if (part.trim()) {
      nodes.push(
        <p key={i} className={styles.prose}>
          {renderInline(part, `m${i}`)}
        </p>,
      );
    }
  });
  return <div className={`${styles.bubble} ${styles.botBubble}`}>{nodes}</div>;
}

function CopyButton({text}: {text: string}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be unavailable in non-secure contexts — ignore.
    }
  }

  return (
    <button
      type="button"
      className={styles.copyBtn}
      onClick={() => void copy()}
      aria-label={copied ? 'Copied' : 'Copy response'}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
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
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentPage(typeof document !== 'undefined' ? document.title : '');
  }, []);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, busy, open]);

  // Focus the input and reset its height when the panel opens.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const autoGrow = useCallback(() => {
    const el = inputRef.current;
    if (!el) {
      return;
    }
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) {
        return;
      }
      setInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
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
    },
    [busy, currentPage, endpoint, messages],
  );

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
                <div className={styles.headerSub}>AI Agents in Practice · ask anything</div>
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
                  <em>AI Agents in Practice</em>. Ask me about any concept,
                  framework, or chapter in the book.
                </p>
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
                  <div className={styles.bubbleWrap}>
                    <MessageBubble message={m} />
                    {m.role === 'assistant' &&
                      i === messages.length - 1 &&
                      lastAssistantEmpty && (
                        <span className={styles.typing} aria-label="Assistant is typing">
                          <span />
                          <span />
                          <span />
                        </span>
                      )}
                  </div>
                  {m.role === 'assistant' && !lastAssistantEmpty && m.content && (
                    <CopyButton text={m.content} />
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
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoGrow();
              }}
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
