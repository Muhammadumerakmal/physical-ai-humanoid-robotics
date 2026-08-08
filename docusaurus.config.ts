import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
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
  // Update this to your production URL when you have one.
  url: 'https://physical-ai-humanoid-robotics.vercel.app',
  baseUrl: '/',

  // GitHub pages deployment config.
  // Not strictly needed if using Vercel, but good practice to keep aligned.
  organizationName: 'Muhammadumerakmal', 
  projectName: 'physical-ai-humanoid-robotics',

  // Preconnect to Google Fonts so the @import in custom.css resolves faster
  // (cuts first-paint latency on the font request; purely additive, no visual change).
  headTags: [
    {
      tagName: 'link',
      attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
  ],

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
        searchResultContextMaxLength: 100,
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
          editUrl: 'https://github.com/Muhammadumerakmal/physical-ai-humanoid-robotics/tree/main/',
          remarkPlugins: [remarkMath], // Render $...$ / $$...$$ as real math (KaTeX).
          rehypePlugins: [[rehypeKatex, {strict: false}]],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        // SEO: Enable sitemap
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
        // Analytics: enabled only when a GA measurement id is provided at build
        // time (`GA_ID=G-XXXXXXXXXX npm run build`), so no tracking id is
        // hard-coded and local/dev builds stay analytics-free.
        gtag: process.env.GA_ID
          ? {trackingID: process.env.GA_ID, anonymizeIP: true}
          : undefined,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social share card (1200x630). Lives at static/img/social-card.svg.
    image: 'img/social-card.svg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    metadata: [
      {name: 'keywords', content: 'physical ai, humanoid robotics, robot learning, ros2, isaac sim, reinforcement learning'},
      {name: 'description', content: 'A practical engineering guide to physical AI and humanoid robots.'},
    ],
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
        {
          to: '/glossary',
          position: 'left',
          label: 'Glossary',
        },
        {
          to: '/authors',
          position: 'right',
          label: 'Authors',
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
          title: 'Learn',
          items: [
            {
              label: 'Start Reading',
              to: '/docs/intro',
            },
            {
              label: 'Book Outline',
              to: '/',
            },
            {
              label: 'Glossary',
              to: '/glossary',
            },
            {
              label: 'Authors',
              to: '/authors',
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
              label: 'II · Sensing & Perception',
              to: '/docs/part2-sensing/sensors-and-actuators',
            },
            {
              label: 'III · Actuation & Control',
              to: '/docs/part3-control/kinematics-dynamics',
            },
            {
              label: 'IV · Learning & Intelligence',
              to: '/docs/part4-learning/reinforcement-learning',
            },
            {
              label: 'V · Systems, Simulation & Deployment',
              to: '/docs/part5-systems/ros2',
            },
            {
              label: 'VI · The Road Ahead',
              to: '/docs/part6-future/future-of-humanoids',
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
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
