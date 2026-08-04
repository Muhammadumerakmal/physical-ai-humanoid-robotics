# Physical AI and Humanoid Robotics

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A practical, open-source engineering guide to the fundamentals of **Physical AI**—the intersection of robotics, machine learning, and control theory. This book provides a bridge from software engineering to embodied intelligence, covering everything from real-time perception-action loops to humanoid locomotion and large-scale simulation.

---

## 📖 About This Book
This repository contains the source code and content for *Physical AI and Humanoid Robotics*. It is designed as a modular, hands-on textbook for software engineers, robotics enthusiasts, and researchers who want to build intelligent machines that interact with the physical world.

## 🚀 Key Features
- **First Principles**: Understand why embodiment is harder than digital AI.
- **Hands-on**: Includes interactive quizzes, coding exercises, and project ideas.
- **Modern Stack**: Covers ROS 2, Isaac Sim, VLA models, and reinforcement learning.
- **Living Document**: This is an open-source project—your contributions help make it better.

## 🛠 Prerequisites
This book assumes familiarity with:
- Python or C++
- Basic linear algebra and calculus
- Fundamental software engineering concepts

## 💻 Local Development

```bash
npm install
npm start                 # the site at http://localhost:3000
npm run agent             # (second terminal) the AI tutor + robot planner proxy
```

The AI tutor and the Robot Lab planner call DeepSeek. Create `agent/.env` with:

```
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_MODEL=deepseek-v4-flash
```

Without a key everything still works — the Robot Lab falls back to an offline
keyword planner. In production, set the same variables in your host's
environment (e.g. Vercel → Settings → Environment Variables).

## 📦 Build, Analytics & PDF

- **Build & checks** — `npm run typecheck` and `npm run build`. CI runs both on
  every push and pull request (`.github/workflows/ci.yml`); the build fails on
  broken links.
- **Analytics** — set a Google Analytics id at build time to enable tracking:
  `GA_ID=G-XXXXXXXXXX npm run build`. With no `GA_ID`, no analytics ship.
- **PDF export** — generate a single-file PDF of the whole book:
  ```bash
  npm run build && npm run serve      # serve on :3000
  npm run export-pdf                  # -> static/physical-ai-book.pdf
  ```
  Requires [PrinceXML](https://www.princexml.com/download/) installed (free for
  non-commercial use).

## 🤝 Contributing
We welcome contributions! Whether you're fixing a typo, improving a code example, or drafting a new chapter, please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📜 License
This project is licensed under the [MIT License](LICENSE).
