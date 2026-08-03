import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import GlossaryList from '@site/src/components/GlossaryList';

export default function GlossaryPage(): ReactNode {
  return (
    <Layout
      title="Glossary"
      description="Definitions of the key terms used throughout Physical AI and Humanoid Robotics — from embodiment and ZMP to VLA models and Isaac Sim.">
      <main className="container margin-vert--lg">
        <Heading as="h1">Glossary</Heading>
        <p style={{fontSize: '1.05rem', color: 'var(--ifm-font-color-secondary)', maxWidth: 760}}>
          Every key term used across the book, in one searchable place. Filter by
          part or search by name, acronym, or definition. Terms also appear as
          hover definitions inside the chapters.
        </p>
        <GlossaryList />
      </main>
    </Layout>
  );
}
