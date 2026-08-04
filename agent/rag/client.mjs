/**
 * Thin Cohere + Qdrant client for RAG (embeddings and vector search).
 *
 * Uses the plain Fetch API (Node >= 20 / Vercel) so no SDK dependency is
 * added to the project. Two entry points are used by the rest of the code:
 *   embed(texts, inputType)   -> array of float vectors
 *   search(query, opts)       -> top-k matching chunks with payload metadata
 */
import {getConfig, configError} from './config.mjs';

const COHERE_V2 = 'https://api.cohere.com/v2/embed';

function qdrantHeaders(config) {
  return {
    'Content-Type': 'application/json',
    'api-key': config.qdrantApiKey,
  };
}

/**
 * Embed a batch of text strings with Cohere.
 * Cohere v2 returns `{embeddings: {float: [...]}}`.
 */
export async function embed(config, texts, inputType) {
  const res = await fetch(`${COHERE_V2}?input_type=${encodeURIComponent(inputType)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.cohereApiKey}`,
    },
    body: JSON.stringify({
      texts,
      model: config.cohereEmbedModel,
      input_type: inputType,
      embedding_types: ['float'],
    }),
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('Retry-After') || 15);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return embed(config, texts, inputType);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cohere embed failed (${res.status}): ${body.slice(0, 500)}`);
  }

  const json = await res.json();
  const floats = json.embeddings?.float;
  if (!Array.isArray(floats)) {
    throw new Error('Cohere embed response missing embeddings.float');
  }
  if (floats[0] && floats[0].length !== config.cohereEmbedDims) {
    throw new Error(
      `Embedding dims (${floats[0].length}) do not match COHERE_EMBED_DIMS (${config.cohereEmbedDims})`,
    );
  }
  return floats;
}

/**
 * Ensure the Qdrant collection exists with the right vector size and a
 * payload index on `source` so we can optionally filter/summarise per page.
 */
export async function ensureCollection(config) {
  const url = `${config.qdrantUrl}/collections/${config.collection}`;
  const head = qdrantHeaders(config);

  try {
    const res = await fetch(url, {method: 'GET', headers: head});
    if (res.ok) {
      // Existing collection — optionally check it has the right vector size.
      const json = await res.json();
      const size = json.result?.config?.params?.vectors?.size;
      if (size !== undefined && size !== config.cohereEmbedDims) {
        throw new Error(
          `Collection vector size (${size}) does not match embed dims (${config.cohereEmbedDims}). Delete or recreate the collection, or change COHERE_EMBED_DIMS.`,
        );
      }
      return;
    }
  } catch (err) {
    if (err.message && (err.message.includes('vector size') || err.message.includes('does not match'))) {
      throw err;
    }
    // fall through to try creating
  }

  const createRes = await fetch(url, {
    method: 'PUT',
    headers: head,
    body: JSON.stringify({
      vectors: {
        size: config.cohereEmbedDims,
        distance: 'Cosine',
      },
      // Only needed so Qdrant accepts a payload index; harmless to define.
      on_disk_payload: true,
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Qdrant create collection failed (${createRes.status}): ${body.slice(0, 500)}`);
  }
}

/**
 * Upsert points in batches. Each point: id, vector, payload {text, source, url}.
 */
const UPSERT_BATCH_SIZE = 256;

export async function upsert(config, points) {
  for (let i = 0; i < points.length; i += UPSERT_BATCH_SIZE) {
    const batch = points.slice(i, i + UPSERT_BATCH_SIZE);
    const res = await fetch(`${config.qdrantUrl}/collections/${config.collection}/points`, {
      method: 'PUT',
      headers: qdrantHeaders(config),
      body: JSON.stringify({points: batch}),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Qdrant upsert failed (${res.status}): ${body.slice(0, 500)}`);
    }
  }
}

/**
 * Query-time search. Embeds the query as a search_query, then does a
 * top-k vector search over the collection.
 */
export async function search(config, query, {topK = 6, filter} = {}) {
  const [vectors] = await embed(config, [query], 'search_query');
  const body = {vector: vectors, limit: topK, with_payload: true};
  if (filter) {
    body.filter = filter;
  }

  const res = await fetch(
    `${config.qdrantUrl}/collections/${config.collection}/points/search`,
    {
      method: 'POST',
      headers: qdrantHeaders(config),
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Qdrant search failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const json = await res.json();
  return (json.result || []).map((hit) => ({
    score: hit.score,
    text: hit.payload?.text || '',
    source: hit.payload?.source || '',
    url: hit.payload?.url || '',
  }));
}

export async function collectionInfo(config) {
  const res = await fetch(`${config.qdrantUrl}/collections/${config.collection}`, {
    headers: qdrantHeaders(config),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.result;
}

export {getConfig, configError};