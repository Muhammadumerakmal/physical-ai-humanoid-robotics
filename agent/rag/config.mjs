/**
 * Shared RAG configuration and env loading.
 *
 * Reads settings from agent/.env (the same dot-file the DeepSeek proxy uses)
 * so credentials never ship in the client bundle. Also honours process.env so
 * the Vercel function can read settings from project environment variables.
 *
 * Add to agent/.env (copy from agent/.env.example):
 *   COHERE_API_KEY    required  (embeddings for both indexing and queries)
 *   COHERE_EMBED_MODEL default embed-english-v3.0
 *   COHERE_EMBED_DIMS default 1024 (must match the model)
 *   QDRANT_URL        required  (e.g. https://<cluster>.cloud.qdrant.io)
 *   QDRANT_API_KEY    required
 *   QDRANT_COLLECTION default physical-ai-book
 */
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const EMBED_INPUT_PREFIX = /^search_/; // informational

export function loadDotenv(dotfilePath) {
  try {
    const text = readFileSync(dotfilePath, 'utf8');
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
    // No dotfile present — fall back to the process environment.
  }
}

loadDotenv(join(__dirname, '..', '.env'));

export function getConfig() {
  return {
    cohereApiKey: process.env.COHERE_API_KEY,
    cohereEmbedModel: process.env.COHERE_EMBED_MODEL || 'embed-english-v3.0',
    cohereEmbedDims: Number(process.env.COHERE_EMBED_DIMS || 1024),
    qdrantUrl: (process.env.QDRANT_URL || '').replace(/\/+$/, ''),
    qdrantApiKey: process.env.QDRANT_API_KEY,
    collection: process.env.QDRANT_COLLECTION || 'physical-ai-book',
  };
}

export function configError(config) {
  if (!config.cohereApiKey) return 'COHERE_API_KEY is not set';
  if (!config.qdrantUrl) return 'QDRANT_URL is not set';
  if (!config.qdrantApiKey) return 'QDRANT_API_KEY is not set';
  return null;
}