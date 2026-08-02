import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';

import styles from './index.module.css';

type Feature = {
  icon: ReactNode;
  title: string;
  text: string;
};

type Chapter = {title: string; to: string};

type Part = {
  num: string;
  title: string;
  chapters: Chapter[];
};

/* ------------------------------------------------------------------ */
/* Minimal stroke icons (Lucide-style)                                 */
/* ------------------------------------------------------------------ */
function Icon({children}: {children: ReactNode}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      {children}
    </svg>
  );
}

const features: Feature[] = [
  {
    icon: (
      <Icon>
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      </Icon>
    ),
    title: 'LLM Foundations',
    text: 'Tokens, attention, prompting, and structured reasoning — and why language models both excel and hallucinate.',
  },
  {
    icon: (
      <Icon>
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </Icon>
    ),
    title: 'Reasoning Loops',
    text: 'ReAct, reflection, and bounded tool-calling loops that turn a single answer into an agent that acts.',
  },
  {
    icon: (
      <Icon>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </Icon>
    ),
    title: 'Tools & Memory',
    text: 'Skills, the Model Context Protocol, retrieval, and state that persists across long-horizon tasks.',
  },
  {
    icon: (
      <Icon>
        <rect x="16" y="16" width="6" height="6" rx="1" />
        <rect x="2" y="16" width="6" height="6" rx="1" />
        <rect x="9" y="2" width="6" height="6" rx="1" />
        <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
        <path d="M12 12V8" />
      </Icon>
    ),
    title: 'Frameworks & Multi-Agent',
    text: 'OpenAI Agents SDK, Google ADK, and LangGraph compared — and when one agent beats many.',
  },
  {
    icon: (
      <Icon>
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </Icon>
    ),
    title: 'Deployment & Operations',
    text: 'Containers, Kubernetes, observability, and cost controls for a worker that runs 24/7.',
  },
  {
    icon: (
      <Icon>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </Icon>
    ),
    title: 'The Business of Agents',
    text: 'The economics of digital workers — when to build, what to charge, and how to get paid.',
  },
];

const parts: Part[] = [
  {
    num: 'I',
    title: 'Foundations',
    chapters: [
      {title: 'What Is an AI Agent?', to: '/docs/part1-foundations/what-is-an-agent'},
      {title: 'How Language Models Work', to: '/docs/part1-foundations/how-llms-work'},
      {title: 'Prompting and Reasoning', to: '/docs/part1-foundations/prompting-and-reasoning'},
      {title: 'Tools and Memory', to: '/docs/part1-foundations/tools-and-memory'},
    ],
  },
  {
    num: 'II',
    title: 'Agent Architectures',
    chapters: [
      {title: 'ReAct and Reasoning Loops', to: '/docs/part2-architectures/react'},
      {title: 'Agent Frameworks', to: '/docs/part2-architectures/frameworks'},
      {title: 'Multi-Agent Systems', to: '/docs/part2-architectures/multi-agent'},
      {title: 'Evaluation and Guardrails', to: '/docs/part2-architectures/evaluation'},
    ],
  },
  {
    num: 'III',
    title: 'Building Agents',
    chapters: [
      {title: 'Skills and Tool Use', to: '/docs/part3-building/skills'},
      {title: 'The Model Context Protocol', to: '/docs/part3-building/mcp'},
      {title: 'Spec-Driven Development', to: '/docs/part3-building/spec-driven'},
      {title: 'From Script to Worker', to: '/docs/part3-building/worker'},
    ],
  },
  {
    num: 'IV',
    title: 'Deployment',
    chapters: [
      {title: 'Containers', to: '/docs/part4-deployment/containers'},
      {title: 'Kubernetes', to: '/docs/part4-deployment/kubernetes'},
      {title: 'Monitoring and Cost', to: '/docs/part4-deployment/monitoring'},
    ],
  },
  {
    num: 'V',
    title: 'The Business of Agents',
    chapters: [
      {title: 'The ROI of a Digital Worker', to: '/docs/part5-business/roi'},
      {title: 'Selling Agent Solutions', to: '/docs/part5-business/selling'},
    ],
  },
];

const stats = [
  {num: '5', label: 'Parts'},
  {num: '17', label: 'Chapters'},
  {num: '2', label: 'Appendices'},
  {num: '1', label: 'Worker, end to end'},
];

const audiences = [
  {
    title: 'Software Developers',
    text: 'You already write code — this book puts an LLM inside a system that ships.',
  },
  {
    title: 'AI Engineers',
    text: 'You know models — this book covers the engineering around them: tools, state, evals, and deployment.',
  },
  {
    title: 'Entrepreneurs & Domain Experts',
    text: 'You know a problem worth automating — this book gives you the vocabulary and the playbook.',
  },
];

const paths = [
  {
    title: 'Straight Through',
    text: 'Parts I–V in order. The complete foundation — recommended.',
    to: '/docs/intro',
  },
  {
    title: 'Builder First',
    text: 'Jump into building and deployment early, then circle back for the theory.',
    to: '/docs/part3-building/skills',
  },
  {
    title: 'Founder Focus',
    text: 'Start with the business of agents to pick your problem, then learn to build it.',
    to: '/docs/part5-business/roi',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.book}>
          <div className={styles.bookCover}>
            <div className={styles.bookEyebrow}>A Practical Guide</div>
            <h1 className={styles.bookTitle}>
              AI Agents <em className={styles.titleAccent}>in Practice</em>
            </h1>
            <div className={styles.bookSubtitle}>Building Autonomous Workers</div>
            <div className={styles.bookDivider} />
            <div className={styles.bookMeta}>
              <span className={styles.bookAuthor}>Muhammad Umer Akmal</span>
              <span className={styles.bookEdition}>First Edition</span>
            </div>
          </div>
        </div>
        <p className={styles.tagline}>{siteConfig.tagline}</p>
        <div className={styles.ctas}>
          <Link className={`${styles.button} ${styles.buttonPrimary}`} to="/docs/intro">
            Start Reading <span aria-hidden="true">→</span>
          </Link>
          <Link className={`${styles.button} ${styles.buttonSecondary}`} to="/#outline">
            View the Book Outline
          </Link>
        </div>
        <div className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <div className={styles.statNum}>{stat.num}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeading}>
          <div className={styles.sectionKicker}>What’s Inside</div>
          <h2 className={styles.sectionTitle}>The full stack of an autonomous worker</h2>
          <p className={styles.sectionSub}>
            Every layer a production agent needs — covered from first principles to
            running code.
          </p>
        </div>
        <div className={styles.features}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StartHere() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeading}>
          <div className={styles.sectionKicker}>Who It’s For</div>
          <Heading as="h2" className={styles.sectionTitle}>
            Three kinds of readers
          </Heading>
          <p className={styles.sectionSub}>
            Built for the people shipping software with an AI or business
            background.
          </p>
        </div>
        <div className={styles.audienceGrid}>
          {audiences.map((a) => (
            <div key={a.title} className={styles.audienceCard}>
              <h3 className={styles.audienceTitle}>{a.title}</h3>
              <p className={styles.featureText}>{a.text}</p>
            </div>
          ))}
        </div>
        <div className={styles.findPath}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>Find Your Path</div>
            <Heading as="h3" className={styles.sectionTitle}>
              How to read this book
            </Heading>
            <p className={styles.sectionSub}>
              Pick the route that matches where you are and where you are going.
            </p>
          </div>
          <div className={styles.pathGrid}>
            {paths.map((p) => (
              <Link key={p.title} to={p.to} className={styles.pathCard}>
                <div className={styles.pathTitle}>{p.title}</div>
                <div className={styles.pathText}>{p.text}</div>
                <span className={styles.pathArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Outline() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeading}>
          <div className={styles.sectionKicker}>Table of Contents</div>
          <Heading as="h2" id="outline" className={styles.sectionTitle}>
            The book, part by part
          </Heading>
          <p className={styles.sectionSub}>
            A working outline of all 17 chapters — each one being written in place.
          </p>
        </div>
        <div className={styles.outline}>
          {parts.map((part) => (
            <div key={part.num} className={styles.partCard}>
              <div className={styles.partHead}>
                <span className={styles.partNum}>PART {part.num}</span>
                <span className={styles.partTitle}>{part.title}</span>
              </div>
              {part.chapters.map((chapter) => (
                <Link key={chapter.to} className={styles.chapterRow} to={chapter.to}>
                  {chapter.title}
                  <span className={styles.chapterArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={styles.ctaBand}>
      <div className={styles.ctaCard}>
        <h2 className={styles.ctaTitle}>Ready to ship your first agent?</h2>
        <p className={styles.ctaText}>
          Start with Part I and work your way through to a worker that runs 24/7 —
          one chapter at a time.
        </p>
        <Link className={styles.ctaButton} to="/docs/intro">
          Start Reading <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <main>
        <HomepageHeader />
        <Features />
        <StartHere />
        <Outline />
        <CallToAction />
      </main>
    </Layout>
  );
}
