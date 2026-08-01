import {handleAgentRequest} from '../agent/handler.mjs';

/**
 * Vercel serverless function → route: /api/agent
 *
 * This is exactly the endpoint the chat widget calls in the production build.
 * Set the following environment variables in the Vercel project settings:
 *   DEEPSEEK_API_KEY=sk-...
 *   DEEPSEEK_BASE_URL=https://api.deepseek.com
 *   DEEPSEEK_MODEL=deepseek-v4-flash
 */
export const config = {
  maxDuration: 60,
};

export default async function agent(req, res) {
  await handleAgentRequest(req, res);
}
