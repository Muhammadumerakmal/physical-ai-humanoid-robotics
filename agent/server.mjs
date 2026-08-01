#!/usr/bin/env node
/**
 * Book Agent — local DeepSeek proxy for the Docusaurus site.
 *
 * Thin HTTP wrapper around agent/handler.mjs (the same handler the Vercel
 * serverless function uses), so the API key never ships in the static site's
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
import {handleAgentRequest} from './handler.mjs';

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
  console.warn(
    '[agent] DEEPSEEK_API_KEY is not set. Copy agent/.env.example to agent/.env and add your key. Requests to /api/agent will return a 500.',
  );
}

const server = http.createServer(async (req, res) => {
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

  await handleAgentRequest(req, res);
});

server.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`[agent] Book agent proxy listening on http://127.0.0.1:${PORT}`);
  console.log(`[agent] Model: ${DEEPSEEK_MODEL}`);
  console.log(`[agent] Base URL: ${DEEPSEEK_BASE_URL}`);
});
