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
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </Icon>
    ),
    title: 'Perception & Sensing',
    text: 'IMUs, encoders, cameras, and depth fused into a world model a robot can actually trust.',
  },
  {
    icon: (
      <Icon>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="2" y1="14" x2="6" y2="14" />
        <line x1="10" y1="8" x2="14" y2="8" />
        <line x1="18" y1="16" x2="22" y2="16" />
      </Icon>
    ),
    title: 'Actuation & Control',
    text: 'Motors, gears, and the control loops that turn torque commands into upright, repeatable motion.',
  },
  {
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </Icon>
    ),
    title: 'Balance & Locomotion',
    text: 'From ZMP walking to model-predictive control — how a biped stands up, steps out, and stays up.',
  },
  {
    icon: (
      <Icon>
        <rect x="6" y="6" width="12" height="12" rx="1.5" />
        <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
        <rect x="9" y="9" width="6" height="6" />
      </Icon>
    ),
    title: 'Learning & Autonomy',
    text: 'Reinforcement learning, imitation, and vision–language–action models that go from language to torques.',
  },
  {
    icon: (
      <Icon>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </Icon>
    ),
    title: 'Simulation & Deployment',
    text: 'MuJoCo, Isaac Lab, and digital twins: train in simulation at scale, ship to hardware with confidence.',
  },
  {
    icon: (
      <Icon>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </Icon>
    ),
    title: 'Safety & Ethics',
    text: 'Estops, torque bounds, and the operating discipline that keeps human-adjacent machines honest.',
  },
];

const parts: Part[] = [
  {
    num: 'I',
    title: 'Foundations',
    chapters: [
      {title: 'What Is Physical AI?', to: '/docs/part1-foundations/what-is-physical-ai'},
      {title: 'Robotics Foundations', to: '/docs/part1-foundations/robotics-foundations'},
      {title: 'The Math Toolkit for Embodied Machines', to: '/docs/part1-foundations/math-toolkit'},
      {title: 'Humanoid Robot Architecture', to: '/docs/part1-foundations/humanoid-architecture'},
    ],
  },
  {
    num: 'II',
    title: 'Sensing & Perception',
    chapters: [
      {title: 'Sensors and Actuators', to: '/docs/part2-sensing/sensors-and-actuators'},
      {title: 'Robot Perception: From Signals to Understanding', to: '/docs/part2-sensing/robot-perception'},
      {title: 'Computer Vision', to: '/docs/part2-sensing/computer-vision'},
      {title: 'State Estimation and Localization', to: '/docs/part2-sensing/state-estimation'},
    ],
  },
  {
    num: 'III',
    title: 'Actuation & Control',
    chapters: [
      {title: 'Kinematics and Dynamics', to: '/docs/part3-control/kinematics-dynamics'},
      {title: 'Motion Control', to: '/docs/part3-control/motion-control'},
      {title: 'Balance and Locomotion', to: '/docs/part3-control/balance-locomotion'},
      {title: 'Manipulation and Grasping', to: '/docs/part3-control/manipulation'},
    ],
  },
  {
    num: 'IV',
    title: 'Learning & Intelligence',
    chapters: [
      {title: 'Machine Learning for Robots', to: '/docs/part4-learning/ml-for-robots'},
      {title: 'Reinforcement Learning', to: '/docs/part4-learning/reinforcement-learning'},
      {title: 'Imitation Learning', to: '/docs/part4-learning/imitation-learning'},
      {title: 'Vision-Language-Action (VLA) Models', to: '/docs/part4-learning/vla-models'},
      {title: 'Large Language Models in Robotics', to: '/docs/part4-learning/llms-in-robotics'},
      {title: 'AI Agents for Robot Control', to: '/docs/part4-learning/ai-agents'},
    ],
  },
  {
    num: 'V',
    title: 'Systems, Simulation & Deployment',
    chapters: [
      {title: 'ROS 2: The Robot Operating System', to: '/docs/part5-systems/ros2'},
      {title: 'Building the Robot Software Stack', to: '/docs/part5-systems/robot-software-stack'},
      {title: 'Simulation for Physical AI', to: '/docs/part5-systems/simulation'},
      {title: 'NVIDIA Isaac Sim and Isaac Lab', to: '/docs/part5-systems/isaac-sim'},
      {title: 'Real-World Deployment', to: '/docs/part5-systems/deployment'},
    ],
  },
  {
    num: 'VI',
    title: 'The Road Ahead',
    chapters: [
      {title: 'The Future of Humanoid Robotics', to: '/docs/part6-future/future-of-humanoids'},
    ],
  },
];

const stats = [
  {num: '6', label: 'Parts'},
  {num: '24', label: 'Chapters'},
  {num: '2', label: 'Simulators · MuJoCo & Isaac Lab'},
  {num: '1', label: 'Working Robot, end to end'},
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.book}>
          <div className={styles.bookCover}>
            <div className={styles.bookEyebrow}>A Technical Book</div>
            <h1 className={styles.bookTitle}>
              Physical AI{' '}
              <em className={styles.titleAccent}>&amp; Humanoid Robotics</em>
            </h1>
            <div className={styles.bookSubtitle}>Building Intelligent Machines</div>
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
          <h2 className={styles.sectionTitle}>The full stack of an intelligent machine</h2>
          <p className={styles.sectionSub}>
            Every layer a physical-AI system needs — covered from first principles to
            working code.
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
            A working outline of all 24 chapters — each one being written in place.
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
        <h2 className={styles.ctaTitle}>Ready to build an intelligent machine?</h2>
        <p className={styles.ctaText}>
          Start with Part I and work your way through to a walking, learning humanoid —
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
        <Outline />
        <CallToAction />
      </main>
    </Layout>
  );
}
