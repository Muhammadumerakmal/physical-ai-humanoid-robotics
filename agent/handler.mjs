/**
 * Shared DeepSeek request handler, used by both:
 *  - agent/server.mjs  (local dev proxy)
 *  - api/agent.mjs     (Vercel serverless function at /api/agent)
 *
 * Configuration comes from the environment so the same code runs anywhere:
 *   DEEPSEEK_API_KEY    required (agent/.env locally; Vercel project settings
 *                       for the deployed function)
 *   DEEPSEEK_BASE_URL   default https://api.deepseek.com
 *   DEEPSEEK_MODEL      default deepseek-v4-flash
 */

/* --- the assistant knows what the book is ------------------------------ */
export const SYSTEM_PROMPT = `You are the companion AI assistant for the book "Physical AI and Humanoid Robotics: Building Intelligent Machines".

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

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function sendJson(res, status, obj) {
  res.writeHead(status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(obj));
}

export async function readJsonBody(req) {
  // Vercel's Node runtime parses JSON bodies into req.body; the local Node
  // http server exposes a raw stream instead.
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
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

export async function handleAgentRequest(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, {error: 'Method not allowed'});
    return;
  }

  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

  if (!DEEPSEEK_API_KEY) {
    sendJson(res, 500, {error: 'DEEPSEEK_API_KEY is not set on the server'});
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch {
    sendJson(res, 400, {error: 'Invalid JSON body'});
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
      sendJson(res, upstream.status, {
        error: `DeepSeek API error ${upstream.status}`,
        detail: text.slice(0, 500),
      });
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
      sendJson(res, 200, json);
    }
  } catch (err) {
    sendJson(res, 502, {
      error: 'Upstream request failed',
      detail: String(err && err.message),
    });
  }
}
