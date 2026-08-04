/**
 * RAG retrieval for the book agent.
 *
 * Embeds the user's latest message with Cohere, searches the Qdrant index of
 * the book's pages, and returns the top-k passages as grounded context that
 * the handler injects into the LLM system prompt.
 */
import {getConfig, configError} from './config.mjs';
import {search} from './client.mjs';

export const RAG_TOP_K = 6;

/**
 * Minimum cosine similarity for a retrieved passage to count as genuinely
 * relevant. Qdrant returns results even for random queries (scores around
 * 0.24–0.35); a well-matched book passage scores well above 0.5.
 */
export const RAG_MIN_SCORE = 0.45;

/**
 * Retrieve the most relevant book passages for a question.
 * Returns {context, hits, relevant, error} where:
 *   context  — ready-to-inject string of passages above RAG_MIN_SCORE
 *   hits     — the raw search results (for debugging / citations)
 *   relevant — true only when at least one passage scores above the threshold
 *
 * Returns {context: '', hits: [], relevant: false} when RAG is not configured.
 */
export async function retrieveContext(question) {
  const config = getConfig();
  const err = configError(config);
  if (err) {
    return {context: '', hits: [], relevant: false, error: err};
  }

  try {
    const hits = await search(config, question, {topK: RAG_TOP_K});
    const good = hits.filter((h) => h.text && h.score >= RAG_MIN_SCORE);
    const context = good
      .map(
        (h, i) =>
          `[${i + 1}] From "${h.source}" (${h.url})\n${h.text.slice(0, 1400)}`,
      )
      .join('\n\n---\n\n');
    return {context, hits, relevant: good.length > 0, error: null};
  } catch (e) {
    return {context: '', hits: [], relevant: false, error: String(e && e.message)};
  }
}