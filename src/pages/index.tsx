import {useEffect, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Reveal from '@site/src/components/Reveal';

import styles from './index.module.css';

/** Route of the interactive humanoid capstone (Part VI · final chapter). */
const CAPSTONE_ROUTE = '/docs/part6-future/capstone-robot-lab';

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
      {title: 'Capstone — The Robot Lab', to: CAPSTONE_ROUTE},
    ],
  },
];

const stats = [
  {num: '6', label: 'Parts'},
  {num: '25', label: 'Chapters'},
  {num: '2', label: 'Simulators · MuJoCo & Isaac Lab'},
  {num: '1', label: 'Working Robot, end to end'},
];

const audiences = [
  {
    title: 'AI Engineers',
    text: 'You already know models and data — learn to map them onto bodies and physics.',
  },
  {
    title: 'Software Developers',
    text: 'You already write code — this book adds the physical layer underneath it.',
  },
  {
    title: 'Students',
    text: 'A structured path from first principles to a working humanoid.',
  },
];

const paths = [
  {
    title: 'Straight Through',
    text: 'Parts I–VI in order. The complete foundation — recommended.',
    to: '/docs/intro',
  },
  {
    title: 'Builder First',
    text: 'Hands-on from the start — jump into the systems chapters early.',
    to: '/docs/part5-systems/ros2',
  },
  {
    title: 'Software Fast Entry',
    text: 'Foundations, then learning and systems, then fill in sensing and control.',
    to: '/docs/part4-learning/ml-for-robots',
  },
  {
    title: 'Research Focus',
    text: 'Start with learning and the road ahead, then deepen into perception.',
    to: '/docs/part4-learning/reinforcement-learning',
  },
];

/** Concrete capabilities the reader walks away with. */
const outcomes = [
  'Read a robot’s sensor suite and fuse it into a world model you can trust',
  'Derive forward and inverse kinematics for a limb and command it smoothly',
  'Keep a biped upright with ZMP and model-predictive control',
  'Train a policy in simulation and transfer it to hardware (sim-to-real)',
  'Wire perception, planning, and control into one ROS 2 control loop',
  'Turn a plain-English instruction into robot motion with a VLA / LLM agent',
  'Stand up MuJoCo and Isaac Lab environments for large-scale training',
  'Command a working humanoid, end to end, in the interactive capstone',
];

/**
 * Honest positioning — how the book differs from the two things readers
 * usually reach for. No named competitors; just the shape of each option.
 */
type CompareRow = {label: string; book: string; tutorials: string; academia: string};
const compareRows: CompareRow[] = [
  {label: 'Scope', book: 'The whole stack, one arc', tutorials: 'A slice at a time', academia: 'Deep but narrow'},
  {label: 'Starting point', book: 'A software engineer’s mental model', tutorials: 'Assumes robotics context', academia: 'Assumes heavy math'},
  {label: 'Math', book: 'Built up when you need it', tutorials: 'Usually skipped', academia: 'Front-loaded'},
  {label: 'Code', book: 'Runnable ROS 2 + MuJoCo', tutorials: 'Copy-paste snippets', academia: 'Pseudocode'},
  {label: 'Payoff', book: 'A humanoid you can command', tutorials: 'A single demo', academia: 'A proof'},
  {label: 'Companion AI', book: 'Book-grounded tutor + robot lab', tutorials: 'None', academia: 'None'},
];

/** Real, honest tech-stack credibility — the tools the book teaches on. */
const stack = [
  {name: 'ROS 2', note: 'Robot middleware'},
  {name: 'MuJoCo', note: 'Physics simulation'},
  {name: 'NVIDIA Isaac', note: 'Sim & training at scale'},
  {name: 'PyTorch', note: 'Learning & policies'},
  {name: 'Python', note: 'The working language'},
  {name: 'VLA & LLMs', note: 'Language to action'},
];

const faqs = [
  {
    q: 'What background do I need?',
    a: 'Comfort with Python and basic linear algebra and calculus. No prior robotics or deep-ML experience is assumed — the book builds up from a software engineer’s mental model.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. The entire book is open-source and readable online, with a companion AI tutor and the interactive Robot Lab included at no cost.',
  },
  {
    q: 'Do I need a robot or a GPU?',
    a: 'No hardware required. Everything runs in simulation (MuJoCo / Isaac Lab) and the capstone humanoid runs right in your browser. A GPU helps for large training runs but is optional.',
  },
  {
    q: 'Python or C++?',
    a: 'Python throughout. It keeps the focus on the ideas; the same concepts carry over to C++ where production performance demands it.',
  },
  {
    q: 'How long does it take?',
    a: 'Six parts, 25 chapters. Most readers work through it over a few focused weeks — but each part stands on its own, so you can also dip in via the reading paths above.',
  },
  {
    q: 'Can I contribute?',
    a: 'Absolutely — it’s a living, open-source document. Fixes, better examples, and new material are all welcome via the GitHub repository.',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.container}>
        <Reveal>
          <Link className={styles.heroBadge} to={CAPSTONE_ROUTE}>
            <span className={styles.heroBadgeDot} aria-hidden="true" />
            New — command a working humanoid at the end of the book
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
        <Reveal>
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
        </Reveal>
        <Reveal delay={90}>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
        </Reveal>
        <Reveal delay={160}>
          <div className={styles.ctas}>
            <Link className={`${styles.button} ${styles.buttonPrimary}`} to="/docs/intro">
              Start Reading <span aria-hidden="true">→</span>
            </Link>
            <Link className={`${styles.button} ${styles.buttonSecondary}`} to={CAPSTONE_ROUTE}>
              See the robot in action
            </Link>
            <Link className={`${styles.button} ${styles.buttonGhost}`} to="/#outline">
              View the Book Outline
            </Link>
          </div>
        </Reveal>
        <Reveal delay={240}>
          <div className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statItem}>
                <div className={styles.statNum}>{stat.num}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionContainer}>
        <Reveal>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>What’s Inside</div>
            <h2 className={styles.sectionTitle}>The full stack of an intelligent machine</h2>
            <p className={styles.sectionSub}>
              Every layer a physical-AI system needs — covered from first principles to
              working code.
            </p>
          </div>
        </Reveal>
        <div className={styles.features}>
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 80}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.text}</p>
              </div>
            </Reveal>
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
        <Reveal>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>Who It’s For</div>
            <Heading as="h2" className={styles.sectionTitle}>
              Three kinds of readers
            </Heading>
            <p className={styles.sectionSub}>
              Built for the people entering robotics with an AI or software
              background.
            </p>
          </div>
        </Reveal>
        <div className={styles.audienceGrid}>
          {audiences.map((a, i) => (
            <Reveal key={a.title} delay={i * 80}>
              <div className={styles.audienceCard}>
                <h3 className={styles.audienceTitle}>{a.title}</h3>
                <p className={styles.featureText}>{a.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className={styles.findPath}>
          <Reveal>
            <div className={styles.sectionHeading}>
              <div className={styles.sectionKicker}>Find Your Path</div>
              <Heading as="h3" className={styles.sectionTitle}>
                How to read this book
              </Heading>
              <p className={styles.sectionSub}>
                Pick the route that matches where you are and where you are going.
              </p>
            </div>
          </Reveal>
          <div className={styles.pathGrid}>
            {paths.map((p, i) => (
              <Reveal key={p.title} delay={(i % 4) * 70}>
                <Link to={p.to} className={styles.pathCard}>
                  <div className={styles.pathTitle}>{p.title}</div>
                  <div className={styles.pathText}>{p.text}</div>
                  <span className={styles.pathArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </Reveal>
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
        <Reveal>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>Table of Contents</div>
            <Heading as="h2" id="outline" className={styles.sectionTitle}>
              The book, part by part
            </Heading>
            <p className={styles.sectionSub}>
              A complete outline of all 25 chapters across six parts.
            </p>
          </div>
        </Reveal>
        <div className={styles.outline}>
          {parts.map((part, i) => (
            <Reveal key={part.num} delay={(i % 3) * 80}>
              <div className={styles.partCard}>
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const capstonePoints = [
  {
    title: 'Talk to it',
    text: 'Type a plain-English command — “walk to the cube and wave” — and watch the book’s AI turn your words into an action plan.',
  },
  {
    title: 'Watch it move',
    text: 'A rigged 3D humanoid executes the plan live in your browser: walking, reaching, pointing, grasping, and balancing.',
  },
  {
    title: 'Run it yourself',
    text: 'Take the same ideas to real code — a ROS 2 + MuJoCo control loop you can clone and run on your own machine.',
  },
];

function Capstone() {
  return (
    <section className={styles.capstoneBand}>
      <div className={styles.sectionContainer}>
        <Reveal>
          <div className={styles.capstoneCard}>
            <div className={styles.capstoneGlow} aria-hidden="true" />
            <div className={styles.capstoneInner}>
              <div className={styles.capstoneCopy}>
                <div className={styles.capstoneKicker}>The Capstone</div>
                <Heading as="h2" className={styles.capstoneTitle}>
                  A physical AI that actually works
                </Heading>
                <p className={styles.capstoneSub}>
                  The book doesn’t end on theory. It ends on an interactive humanoid you
                  command in natural language — the perception, control, and learning ideas
                  from every chapter, wired into one embodied loop you can drive yourself.
                </p>
                <div className={styles.capstoneList}>
                  {capstonePoints.map((p, i) => (
                    <div key={p.title} className={styles.capstoneItem}>
                      <span className={styles.capstoneNum}>{i + 1}</span>
                      <div>
                        <div className={styles.capstoneItemTitle}>{p.title}</div>
                        <div className={styles.capstoneItemText}>{p.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link className={styles.capstoneButton} to={CAPSTONE_ROUTE}>
                  Open the Robot Lab <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className={styles.capstoneVisual} aria-hidden="true">
                <div className={styles.robotFigure}>
                  <span className={styles.robotHead} />
                  <span className={styles.robotTorso} />
                  <span className={`${styles.robotArm} ${styles.robotArmL}`} />
                  <span className={`${styles.robotArm} ${styles.robotArmR}`} />
                  <span className={`${styles.robotLeg} ${styles.robotLegL}`} />
                  <span className={`${styles.robotLeg} ${styles.robotLegR}`} />
                </div>
                <div className={styles.robotPrompt}>“walk over and wave” →</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Outcomes() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.sectionContainer}>
        <Reveal>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>Learning Outcomes</div>
            <Heading as="h2" className={styles.sectionTitle}>
              What you’ll be able to do
            </Heading>
            <p className={styles.sectionSub}>
              Not just concepts — concrete skills. By the last chapter, each of these is
              something you’ve actually built.
            </p>
          </div>
        </Reveal>
        <div className={styles.outcomeGrid}>
          {outcomes.map((o, i) => (
            <Reveal key={o} delay={(i % 2) * 70}>
              <div className={styles.outcomeItem}>
                <span className={styles.outcomeCheck} aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>{o}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyDifferent() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionContainer}>
        <Reveal>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>Why This Book</div>
            <Heading as="h2" className={styles.sectionTitle}>
              Made to actually get you building
            </Heading>
            <p className={styles.sectionSub}>
              Most learning splits into scattered tutorials or dense academic texts. This
              book takes the middle path — rigorous, but aimed at a working robot.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className={styles.compareWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th />
                  <th className={styles.compareUs}>This book</th>
                  <th>Scattered tutorials</th>
                  <th>Academic textbooks</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td className={styles.compareUs}>
                      <span className={styles.compareTick} aria-hidden="true">✓</span>
                      {row.book}
                    </td>
                    <td>{row.tutorials}</td>
                    <td>{row.academia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* Example commands cycled through the self-typing console. */
const DEMO_COMMANDS: {cmd: string; plan: string[]}[] = [
  {cmd: 'walk to the cube and wave', plan: ['walk_to · cube', 'wave']},
  {cmd: 'pick up the cube and throw it', plan: ['walk_to · cube', 'pick_up · cube', 'throw']},
  {cmd: 'do a little dance then sit down', plan: ['dance', 'sit']},
  {cmd: 'spin around, then come here', plan: ['spin', 'come_here']},
];

/**
 * A signature, self-typing command console that mirrors the capstone Robot
 * Lab: it types a natural-language command, then reveals the action plan the
 * book's planner would produce. Pure CSS/JS, decorative, reduced-motion aware.
 */
function CommandDemo() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const current = DEMO_COMMANDS[idx];
    if (prefersReduced) {
      setTyped(current.cmd);
      setShowPlan(true);
      const hold = window.setTimeout(
        () => setIdx((v) => (v + 1) % DEMO_COMMANDS.length),
        3600,
      );
      return () => window.clearTimeout(hold);
    }

    let charTimer: number;
    let planTimer: number;
    let nextTimer: number;
    setTyped('');
    setShowPlan(false);

    let i = 0;
    const type = () => {
      i += 1;
      setTyped(current.cmd.slice(0, i));
      if (i < current.cmd.length) {
        charTimer = window.setTimeout(type, 45);
      } else {
        planTimer = window.setTimeout(() => setShowPlan(true), 450);
        nextTimer = window.setTimeout(
          () => setIdx((v) => (v + 1) % DEMO_COMMANDS.length),
          3400,
        );
      }
    };
    charTimer = window.setTimeout(type, 400);

    return () => {
      window.clearTimeout(charTimer);
      window.clearTimeout(planTimer);
      window.clearTimeout(nextTimer);
    };
  }, [idx]);

  const current = DEMO_COMMANDS[idx];

  return (
    <section className={styles.section}>
      <div className={styles.sectionContainer}>
        <Reveal>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>See It Think</div>
            <Heading as="h2" className={styles.sectionTitle}>
              From plain English to an action plan
            </Heading>
            <p className={styles.sectionSub}>
              The same planner that drives the capstone humanoid, live. Type a command —
              get an ordered plan of skills the robot can execute.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className={styles.console}>
            <div className={styles.consoleBar}>
              <span className={styles.consoleDot} />
              <span className={styles.consoleDot} />
              <span className={styles.consoleDot} />
              <span className={styles.consoleTitle}>robot-lab · planner</span>
            </div>
            <div className={styles.consoleBody}>
              <div className={styles.consolePrompt}>
                <span className={styles.consoleCaret}>❯</span>
                <span className={styles.consoleCmd}>
                  {typed}
                  <span className={styles.consoleCursor} aria-hidden="true" />
                </span>
              </div>
              <div
                className={`${styles.consolePlan} ${showPlan ? styles.consolePlanOn : ''}`}
                aria-live="polite">
                <div className={styles.consolePlanLabel}>plan</div>
                {current.plan.map((step, i) => (
                  <div
                    key={step}
                    className={styles.consoleStep}
                    style={{transitionDelay: `${i * 110}ms`}}>
                    <span className={styles.consoleStepNum}>{i + 1}</span>
                    <code>{step}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className={styles.consoleCta}>
            <Link className={`${styles.button} ${styles.buttonSecondary}`} to={CAPSTONE_ROUTE}>
              Try it live in the Robot Lab <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BuiltOn() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.sectionContainer}>
        <Reveal>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>The Real Stack</div>
            <Heading as="h2" className={styles.sectionTitle}>
              The tools professionals actually use
            </Heading>
            <p className={styles.sectionSub}>
              No toy frameworks. You learn on the same stack that ships real robots.
            </p>
          </div>
        </Reveal>
        <div className={styles.stackGrid}>
          {stack.map((s, i) => (
            <Reveal key={s.name} delay={(i % 3) * 70}>
              <div className={styles.stackCard}>
                <div className={styles.stackName}>{s.name}</div>
                <div className={styles.stackNote}>{s.note}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionContainer}>
        <Reveal>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>FAQ</div>
            <Heading as="h2" className={styles.sectionTitle}>
              Questions, answered
            </Heading>
          </div>
        </Reveal>
        <div className={styles.faqList}>
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={(i % 2) * 60}>
              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>
                  {f.q}
                  <span className={styles.faqIcon} aria-hidden="true">+</span>
                </summary>
                <div className={styles.faqA}>{f.a}</div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={styles.ctaBand}>
      <Reveal>
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
      </Reveal>
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
        <Outcomes />
        <StartHere />
        <WhyDifferent />
        <CommandDemo />
        <Outline />
        <Capstone />
        <BuiltOn />
        <FAQ />
        <CallToAction />
      </main>
    </Layout>
  );
}
