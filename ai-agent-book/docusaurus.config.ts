import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'AI Agents in Practice',
  tagline:
    'Building, deploying, and selling autonomous AI workers — a practical engineering guide to the agent era',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://ai-agent-book.example.com',
  baseUrl: '/',

  organizationName: 'Muhammadumerakmal',
  projectName: 'ai-agent-book',

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  customFields: {
    agentEndpoint: process.env.AGENT_ENDPOINT ?? null,
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        docsRouteBasePath: '/docs',
        indexBlog: false,
        indexPages: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          remarkPlugins: [remarkMath],
          rehypePlugins: [[rehypeKatex, {strict: false}]],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.svg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    metadata: [
      {
        name: 'keywords',
        content:
          'ai agents, agent architecture, react, mcp, multi-agent systems, llm, agent deployment, autonomous workers',
      },
      {
        name: 'description',
        content:
          'A practical engineering guide to building, deploying, and selling autonomous AI workers.',
      },
    ],
    navbar: {
      title: 'AI Agents',
      logo: {
        alt: 'AI Agents in Practice',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'agents',
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
          title: 'Learn',
          items: [
            {label: 'Start Reading', to: '/docs/intro'},
            {label: 'Curriculum', to: '/'},
            {label: 'Glossary', to: '/docs/appendices/a-glossary'},
          ],
        },
        {
          title: 'Parts',
          items: [
            {label: 'I · Foundations', to: '/docs/part1-foundations/what-is-an-agent'},
            {label: 'II · Architectures', to: '/docs/part2-architectures/react'},
            {label: 'III · Building', to: '/docs/part3-building/skills'},
            {label: 'IV · Deployment', to: '/docs/part4-deployment/containers'},
            {label: 'V · Business', to: '/docs/part5-business/roi'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AI Agents in Practice. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
