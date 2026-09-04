import {useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './authors.module.css';

/**
 * Author photo. Drop a square image at `static/img/author.jpg` and it appears
 * here automatically; until then it falls back to the author's initials, so the
 * page never shows a broken image.
 */
function Avatar({src, initials}: {src: string; initials: string}) {
  const [failed, setFailed] = useState(false);
  const resolved = useBaseUrl(src);
  if (failed) {
    return (
      <div className={styles.avatar} aria-hidden="true">
        {initials}
      </div>
    );
  }
  return (
    <img
      className={styles.avatarImg}
      src={resolved}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

type Author = {
  name: string;
  role: string;
  initials: string;
  photo: string;
  bio: string;
  focus: string[];
  links: {label: string; href: string}[];
};

// Add your LinkedIn URL here to surface a LinkedIn link (leave '' to hide it).
const LINKEDIN_URL = '';

const AUTHORS: Author[] = [
  {
    name: 'Muhammad Umer Akmal',
    role: 'Author & Maintainer',
    initials: 'UA',
    photo: '/img/author.jpg',
    bio: 'Software and AI engineer writing Physical AI and Humanoid Robotics to bridge the gap between the software world and embodied intelligence — turning the hard-won knowledge of robotics, control, and machine learning into a path a working engineer can actually walk.',
    focus: ['Physical AI', 'Humanoid Robotics', 'Reinforcement Learning', 'ROS 2', 'Simulation'],
    links: [
      {label: 'GitHub', href: 'https://github.com/Muhammadumerakmal'},
      ...(LINKEDIN_URL ? [{label: 'LinkedIn', href: LINKEDIN_URL}] : []),
    ],
  },
];

export default function AuthorsPage(): ReactNode {
  return (
    <Layout
      title="Authors"
      description="The people behind Physical AI and Humanoid Robotics.">
      <main className="container margin-vert--lg">
        <div className={styles.head}>
          <div className={styles.kicker}>The Team</div>
          <Heading as="h1" className={styles.title}>
            Authors
          </Heading>
          <p className={styles.lede}>
            This book is an open, living project — written for the engineers crossing
            from software into physical AI, and improved in public.
          </p>
        </div>

        <div className={styles.grid}>
          {AUTHORS.map((a) => (
            <article key={a.name} className={styles.card}>
              <Avatar src={a.photo} initials={a.initials} />
              <div className={styles.body}>
                <h2 className={styles.name}>{a.name}</h2>
                <p className={styles.role}>{a.role}</p>
                <p className={styles.bio}>{a.bio}</p>
                {a.focus.length > 0 && (
                  <div className={styles.chips}>
                    {a.focus.map((f) => (
                      <span key={f} className={styles.chip}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.links}>
                  {a.links.map((l) => (
                    <Link key={l.href} className={styles.link} to={l.href}>
                      {l.label} ↗
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className={styles.contribute}>
          <h2>Contribute</h2>
          <p>
            Found an error, or want to add a chapter, diagram, or exercise? This
            book is MIT-licensed and open to contributions. Start with the{' '}
            <Link to="/docs/intro">introduction</Link> to see how it is
            structured, then open a pull request.
          </p>
        </section>
      </main>
    </Layout>
  );
}
