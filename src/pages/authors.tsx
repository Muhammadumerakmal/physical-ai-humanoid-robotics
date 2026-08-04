import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './authors.module.css';

type Author = {
  name: string;
  role: string;
  initials: string;
  bio: string;
  links: {label: string; href: string}[];
};

const AUTHORS: Author[] = [
  {
    name: 'Muhammad Umer Akmal',
    role: 'Author & Maintainer',
    initials: 'UA',
    bio: 'Software and AI engineer writing Physical AI and Humanoid Robotics to bridge the gap between the software world and embodied intelligence — turning the hard-won knowledge of robotics, control, and machine learning into a path a working engineer can actually walk.',
    links: [
      {label: 'GitHub', href: 'https://github.com/Muhammadumerakmal'},
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
          <Heading as="h1">Authors</Heading>
          <p className={styles.lede}>
            This book is an open, living project. It is written for the engineers
            crossing from software into physical AI — and improved in public.
          </p>
        </div>

        <div className={styles.grid}>
          {AUTHORS.map((a) => (
            <article key={a.name} className={styles.card}>
              <div className={styles.avatar} aria-hidden="true">
                {a.initials}
              </div>
              <div className={styles.body}>
                <h2 className={styles.name}>{a.name}</h2>
                <p className={styles.role}>{a.role}</p>
                <p className={styles.bio}>{a.bio}</p>
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
