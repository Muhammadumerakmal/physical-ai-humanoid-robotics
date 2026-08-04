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
 * Retrieve the most relevant book passages for a question.
 * Returns {context, hits} where context is a ready-to-inject string and
 * hits is the raw search results (for debugging / citations).
 *
 * Returns {context: '', hits: []} when RAG is not configured.
 */
export async function retrieveContext(question) {
  const config = getConfig();
  const err = configError(config);
  if (err) {
    return {context: '', hits: [], error: err};
  }

  try {
    const hits = await search(config, question, {topK: RAG_TOP_K});
    const context = hits
      .filter((h) => h.text)
      .map(
        (h, i) =>
          `[${i + 1}] From "${h.source}" (${h.url})\n${h.text.slice(0, 1400)}`,
      )
      .join('\n\n---\n\n');
    return {context, hits, error: null};
  } catch (e) {
    return {context: '', hits: [], error: String(e && e.message)};
  }
}