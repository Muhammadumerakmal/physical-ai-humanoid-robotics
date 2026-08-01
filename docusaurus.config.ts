import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI and Humanoid Robotics',
  tagline:
    'Building Intelligent Machines — a practical engineering guide to physical AI and humanoid robots',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here.
  // Update this to the real URL when the book is published.
  url: 'https://physical-ai-book.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served.
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'physical-ai-book', // Usually your GitHub org/user name.
  projectName: 'physical-ai-book', // Usually your repo name.

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  customFields: {
    // The AI book assistant calls this endpoint. If unset, the widget uses the
    // local agent proxy in development and the same-origin "/api/agent" in the
    // production build (deploy the agent from ./agent as a serverless function).
    // Override at build time: AGENT_ENDPOINT=https://your-host/api/agent
    agentEndpoint: process.env.AGENT_ENDPOINT ?? null,
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          // No git repo yet, so no "Edit this page" links.
        },
        blog: false, // The book is a documentation site; no blog.
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social share card. Replace with a generated banner when publishing.
    image: 'img/logo.svg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI & Humanoids',
      logo: {
        alt: 'Physical AI and Humanoid Robotics',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'book',
          position: 'left',
          label: 'Book',
        },
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Start Reading',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'The Book',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Table of Contents',
              to: '/docs/part1-foundations/what-is-physical-ai',
            },
          ],
        },
        {
          title: 'Parts',
          items: [
            {
              label: 'I · Foundations',
              to: '/docs/part1-foundations/what-is-physical-ai',
            },
            {
              label: 'II · Perception & Sensing',
              to: '/docs/part2-perception/sensors-and-calibration',
            },
            {
              label: 'III · Actuation & Control',
              to: '/docs/part3-control/actuation-and-hardware',
            },
            {
              label: 'IV · Learning & Autonomy',
              to: '/docs/part4-learning/reinforcement-learning',
            },
            {
              label: 'V · Systems & Deployment',
              to: '/docs/part5-deployment/system-architecture',
            },
          ],
        },
        {
          title: 'Appendix',
          items: [
            {
              label: 'Glossary',
              to: '/docs/appendices/a-glossary',
            },
            {
              label: 'Further Reading',
              to: '/docs/appendices/b-resources',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI and Humanoid Robotics. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
