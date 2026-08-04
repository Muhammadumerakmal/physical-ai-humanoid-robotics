/**
 * Build the RAG index for the Physical AI book.
 *
 * Crawls the deployed book's sitemap, extracts the readable text from each
 * article page, chunks it into overlapping passages, embeds them with Cohere
 * and upserts them into Qdrant.
 *
 * Usage:
 *   node scripts/index-site.mjs [--site https://...] [--wipe]
 *
 *   --site   base URL of the deployed book (default: physical-ai-humanoid-robotics-five-iota.vercel.app)
 *   --wipe   delete and recreate the Qdrant collection first (drops old data)
 *
 * Requires agent/.env with COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY.
 */
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getConfig, configError} from '../agent/rag/config.mjs';
import {embed, ensureCollection, upsert, collectionInfo} from '../agent/rag/client.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = process.argv.find((a) => a.startsWith('--site='))?.slice('--site='.length);
const WIPE = process.argv.includes('--wipe');

const config = getConfig();
const err = configError(config);
if (err) {
  console.error(`[index] Missing configuration: ${err}`);
  console.error('[index] Copy agent/.env.example to agent/.env and add your keys.');
  process.exit(1);
}

const BASE_URL = SITE || 'https://physical-ai-humanoid-robotics-five-iota.vercel.app';
const DEFAULT_DOMAIN = 'https://physical-ai-humanoid-robotics.vercel.app';
const CHUNK_SIZE = 1100;
const CHUNK_OVERLAP = 120;
const CONCURRENCY = 6;

/* ----------------------------- html -> text ----------------------------- */

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<td[^>]*>/gi, ' | ')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
}

/** Extract the Docusaurus <article> body (chapter content) from a page. */
function extractArticle(html) {
  const start = html.indexOf('<article');
  const end = html.indexOf('</article>');
  if (start === -1 || end === -1) return '';
  return html.slice(start, end + 9);
}

function extractTitle(html) {
  const m = html.match(/<title>(.*?)<\/title>/i);
  if (!m) return '';
  return m[1]
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .split('|')[0]
    .trim();
}

function normalizeUrl(rawUrl, base) {
  const url = rawUrl.replace(DEFAULT_DOMAIN, BASE_URL);
  return url.startsWith('http') ? url : `${base}${url}`;
}

/* ------------------------------- chunking -------------------------------- */

/** Split plain text into overlapping passages on paragraph boundaries. */
function chunkText(text) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const chunks = [];
  let buffer = '';
  for (const p of paragraphs) {
    if (buffer && buffer.length + p.length + 2 > CHUNK_SIZE) {
      chunks.push(buffer.trim());
      // Overlap: reuse the tail of the previous buffer so no context is lost.
      const overlap = buffer.slice(-CHUNK_OVERLAP);
      buffer = overlap + '\n\n' + p;
    } else {
      buffer = buffer ? `${buffer}\n\n${p}` : p;
    }
  }
  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
}

/* ------------------------------- fetching -------------------------------- */

async function fetchText(url, retries = 3) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {'User-Agent': 'physical-ai-book-indexer/1.0'},
        redirect: 'follow',
      });
      if (res.ok) return await res.text();
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  throw lastErr;
}

async function fetchSitemap() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`, {
    headers: {'User-Agent': 'physical-ai-book-indexer/1.0'},
  });
  if (!res.ok) throw new Error(`sitemap fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  return urls.map((u) => normalizeUrl(u.trim(), BASE_URL));
}

/** Convert a sitemap URL into a short label, e.g. part3-control/manipulation. */
function urlLabel(url) {
  return url
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\//, '')
    .replace(/\.html$/, '');
}

/* --------------------------------- main ---------------------------------- */

async function crawlPages(urls) {
  const results = [];
  let cursor = 0;

  async function worker() {
    for (;;) {
      const idx = cursor;
      cursor += 1;
      if (idx >= urls.length) return;
      const url = urls[idx];
      try {
        const html = await fetchText(url);
        const article = extractArticle(html);
        if (!article.trim()) {
          console.log(`[index] skip (no article): ${url}`);
          continue;
        }
        const text = stripTags(article).trim();
        if (text.length < 40) {
          console.log(`[index] skip (too short): ${url}`);
          continue;
        }
        const title = extractTitle(html) || urlLabel(url);
        const chunks = chunkText(text);
        console.log(`[index] ${url} -> ${chunks.length} chunk(s)`);
        results.push({url, title, chunks});
      } catch (e) {
        console.error(`[index] failed ${url}: ${e.message}`);
      }
    }
  }

  await Promise.all(Array.from({length: CONCURRENCY}, () => worker()));
  return results;
}

async function run() {
  console.log(`[index] crawling ${BASE_URL}/sitemap.xml`);
  const urls = await fetchSitemap();
  console.log(`[index] ${urls.length} URL(s) in sitemap`);

  const pages = await crawlPages(urls);
  const totalChunks = pages.reduce((n, p) => n + p.chunks.length, 0);
  console.log(`[index] extracted ${pages.length} page(s), ${totalChunks} chunk(s)`);

  await ensureCollection(config);

  if (WIPE) {
    console.log('[index] --wipe: deleting collection before reindexing');
    await fetch(`${config.qdrantUrl}/collections/${config.collection}`, {
      method: 'DELETE',
      headers: {'api-key': config.qdrantApiKey},
    });
    await ensureCollection(config);
  }

  const points = [];
  let pointId = 1;
  for (const page of pages) {
    for (const chunk of page.chunks) {
      points.push({
        id: pointId,
        payload: {
          text: chunk,
          source: page.title,
          url: page.url,
        },
      });
      pointId += 1;
    }
  }

  if (points.length === 0) {
    console.warn('[index] nothing to index');
    return;
  }

  // Embed in batches of 32 to stay within Cohere trial per-minute token caps.
  for (let i = 0; i < points.length; i += 32) {
    const batch = points.slice(i, i + 32);
    const texts = batch.map((p) => p.payload.text);
    console.log(`[index] embedding ${texts.length} chunk(s) (${i + 1}-${Math.min(i + texts.length, points.length)}/${points.length})`);
    const vectors = await embed(config, texts, 'search_document');
    batch.forEach((p, j) => {
      p.vector = vectors[j];
    });
    await upsert(config, batch);
  }

  const info = await collectionInfo(config);
  console.log('[index] done. Qdrant collection:');
  console.log(JSON.stringify({collection: config.collection, points: info?.points_count}, null, 2));

  // Dump a manifest for reference/debugging.
  try {
    mkdirSync(join(__dirname, '..', 'build'), {recursive: true});
    writeFileSync(
      join(__dirname, '..', 'build', 'rag-manifest.json'),
      JSON.stringify({site: BASE_URL, pages, totalChunks}, null, 2),
    );
  } catch {
    // Non-fatal: the manifest is just a debug aid.
  }
}

run().catch((e) => {
  console.error('[index] fatal:', e);
  process.exit(1);
});