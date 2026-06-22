/* ============================================================
   NEXA — LLM layer (provider-agnostic, zero-dependency)
   ------------------------------------------------------------
   Turns NEXA's engine from regex-routing into a real
   Understand → Decide → Execute loop when a model key is present.

   Supported providers (auto-detected from env):
     • Anthropic  — ANTHROPIC_API_KEY        (model: NEXA_LLM_MODEL or claude default)
     • OpenAI     — OPENAI_API_KEY           (model: NEXA_LLM_MODEL or gpt default)

   If no key is set, isLive() returns false and the engine falls
   back to its deterministic behaviour — so the demo always runs.

   Uses global fetch (Node 18+). No external packages.
   ============================================================ */

const ANTHROPIC_KEY = () => process.env.ANTHROPIC_API_KEY;
const OPENAI_KEY = () => process.env.OPENAI_API_KEY;

function provider() {
  if (ANTHROPIC_KEY()) return 'anthropic';
  if (OPENAI_KEY()) return 'openai';
  return null;
}
function isLive() { return provider() !== null; }

async function anthropic(system, user, { maxTokens = 600, temperature = 0.2 } = {}) {
  const model = process.env.NEXA_LLM_MODEL || 'claude-sonnet-4-6';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_KEY(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model, max_tokens: maxTokens, temperature,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.content || []).map(c => c.text || '').join('').trim();
}

async function openai(system, user, { maxTokens = 600, temperature = 0.2 } = {}) {
  const model = process.env.NEXA_LLM_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_KEY()}` },
    body: JSON.stringify({
      model, max_tokens: maxTokens, temperature,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

async function complete(system, user, opts) {
  const p = provider();
  if (p === 'anthropic') return anthropic(system, user, opts);
  if (p === 'openai') return openai(system, user, opts);
  throw new Error('no LLM provider configured');
}

/* Ask the model to return JSON; parses defensively, returns null on failure. */
async function completeJSON(system, user, opts) {
  const raw = await complete(system + '\n\nRespond with valid JSON only, no prose.', user, opts);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

module.exports = { isLive, provider, complete, completeJSON };
