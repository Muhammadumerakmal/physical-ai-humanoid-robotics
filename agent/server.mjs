#!/usr/bin/env node
/**
 * Book Agent — local DeepSeek proxy for the Docusaurus site.
 *
 * A tiny dependency-free HTTP server that forwards chat requests to the DeepSeek
 * API (OpenAI-compatible) so the API key never ships in the static site's
 * client bundle.
 *
 *   npm run agent          # start the server (listens on 127.0.0.1:8787)
 *
 * Endpoints:
 *   POST /api/agent        chat completion (SSE-streamed)
 *   GET  /health           liveness probe
 *
 * Configuration (agent/.env, copied from agent/.env.example):
 *   DEEPSEEK_API_KEY    required
 *   DEEPSEEK_BASE_URL   default https://api.deepseek.com
 *   DEEPSEEK_MODEL      default deepseek-v4-flash
 *   PORT                default 8787
 */
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/* --- load agent/.env without pulling in a dependency ------------------ */
function loadEnv() {
  try {
    const text = readFileSync(join(__dirname, '.env'), 'utf8');
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      const value = line
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // No .env file — fall back to the process environment.
  }
}
loadEnv();

const {
  DEEPSEEK_API_KEY,
  DEEPSEEK_BASE_URL = 'https://api.deepseek.com',
  DEEPSEEK_MODEL = 'deepseek-v4-flash',
  PORT = '8787',
} = process.env;

if (!DEEPSEEK_API_KEY) {
  console.error(
    '[agent] DEEPSEEK_API_KEY is not set. Copy agent/.env.example to agent/.env and add your key.',
  );
  process.exit(1);
}

/* --- the assistant knows what the book is ------------------------------ */
const SYSTEM_PROMPT = `You are the companion AI assistant for the book "Physical AI and Humanoid Robotics: Building Intelligent Machines".

Help readers understand concepts, work through the chapter exercises, and debug their robotics projects. Be precise, practical, and concise. Use short code or math snippets where they genuinely help.

The book covers the full stack of embodied intelligence:
- Foundations of physical AI (what makes embodied intelligence different from digital AI)
- Perception & sensing (IMUs, encoders, cameras, depth, state estimation / SLAM)
- Actuation & control (actuators, kinematics & dynamics, balance & locomotion, manipulation)
- Learning & autonomy (reinforcement learning, imitation learning, vision–language–action models, LLM task planning)
- Systems & deployment (robot software architecture, simulation with MuJoCo & Isaac Lab, safety & ethics)

Chapter outline:
Part I · Foundations — "What Is Physical AI?", "The Anatomy of a Humanoid", "Math for Embodied Machines"
Part II · Perception & Sensing — "Sensor Suites and Calibration", "Vision, Depth, and World Models", "State Estimation and SLAM"
Part III · Actuation & Control — "Actuators, Gears, and Drive Trains", "Kinematics and Dynamics", "Balance and Locomotion", "Manipulation and Contact"
Part IV · Learning & Autonomy — "Reinforcement Learning for Robots", "Imitation Learning and Teleoperation", "Vision–Language–Action Models", "Task Planning with LLMs"
Part V · Systems & Deployment — "Robot System Architecture", "The Simulation Ecosystem", "Safety, Ethics, and Deployment"
Appendices — Glossary, Further Reading & Resources

If you do not know something, say so rather than guessing. Do not fabricate API or hardware specifications.`;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer(async (req, res) => {
  setCors(res);
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ok: true, model: DEEPSEEK_MODEL}));
    return;
  }

  if (req.method !== 'POST' || url.pathname !== '/api/agent') {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Not found'}));
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch {
    res.writeHead(400, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Invalid JSON body'}));
    return;
  }

  const {messages = [], stream = true, currentPage, temperature} = payload;

  const system = currentPage
    ? `${SYSTEM_PROMPT}\n\nThe reader is currently viewing: ${String(currentPage).slice(0, 300)}.`
    : SYSTEM_PROMPT;

  const upstreamBody = {
    model: DEEPSEEK_MODEL,
    stream,
    messages: [{role: 'system', content: system}, ...messages],
  };
  if (temperature !== undefined) {
    upstreamBody.temperature = temperature;
  }

  try {
    const upstream = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(upstreamBody),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      res.writeHead(upstream.status, {'Content-Type': 'application/json'});
      res.end(
        JSON.stringify({
          error: `DeepSeek API error ${upstream.status}`,
          detail: text.slice(0, 500),
        }),
      );
      return;
    }

    if (stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      const reader = upstream.body.getReader();
      try {
        for (;;) {
          const {done, value} = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
      } finally {
        reader.releaseLock();
      }
      res.end();
    } else {
      const json = await upstream.json();
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(json));
    }
  } catch (err) {
    res.writeHead(502, {'Content-Type': 'application/json'});
    res.end(
      JSON.stringify({
        error: 'Upstream request failed',
        detail: String(err && err.message),
      }),
    );
  }
});

server.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`[agent] Book agent proxy listening on http://127.0.0.1:${PORT}`);
  console.log(`[agent] Model: ${DEEPSEEK_MODEL}`);
  console.log(`[agent] Base URL: ${DEEPSEEK_BASE_URL}`);
});
