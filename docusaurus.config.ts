import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Google Fonts stylesheet for the design system (Inter / JetBrains Mono /
// Source Serif 4). Loaded from <head> below rather than via an `@import` in
// custom.css: an `@import` chains behind the main CSS download and blocks
// render, so we load it non-blocking (preload + media-swap) instead.
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,500&display=swap';

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

  // Fonts, loaded non-blocking so they never gate first paint:
  //  - preconnect warms the two font hosts,
  //  - preload fetches the stylesheet at high priority without blocking render,
  //  - the `media="print"` + `onload` swap flips it to a real stylesheet once
  //    fetched (text shows immediately in a fallback face via `display=swap`),
  //  - the <noscript> copy keeps fonts working with JS disabled.
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
    {
      tagName: 'link',
      attributes: {rel: 'preload', as: 'style', href: GOOGLE_FONTS_HREF},
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: GOOGLE_FONTS_HREF,
        media: 'print',
        onload: "this.media='all'",
      },
    },
    {
      tagName: 'noscript',
      attributes: {},
      innerHTML: `<link rel="stylesheet" href="${GOOGLE_FONTS_HREF}">`,
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

  // Locales are enabled with right-to-left support for Urdu & Arabic. Pages
  // without translations fall back to the English source, so the language
  // switcher works immediately and translated content can be added over time
  // under `i18n/<locale>/`.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur', 'ur-Latn', 'ar', 'zh', 'hi'],
    localeConfigs: {
      en: {label: 'English', direction: 'ltr', htmlLang: 'en'},
      ur: {label: 'اردو', direction: 'rtl', htmlLang: 'ur'},
      'ur-Latn': {label: 'Roman Urdu', direction: 'ltr', htmlLang: 'ur'},
      ar: {label: 'العربية', direction: 'rtl', htmlLang: 'ar'},
      zh: {label: '中文', direction: 'ltr', htmlLang: 'zh-Hans'},
      hi: {label: 'हिन्दी', direction: 'ltr', htmlLang: 'hi'},
    },
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
          to: '/leaderboard',
          position: 'left',
          label: 'Progress',
        },
        {
          to: '/authors',
          position: 'right',
          label: 'Authors',
        },
        {
          type: 'localeDropdown',
          position: 'right',
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
