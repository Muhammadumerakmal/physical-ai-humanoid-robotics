/**
 * Skill vocabulary for the RobotLab humanoid, shared by the 3D scene and the
 * offline command parser. Kept in sync with ROBOT_SKILLS in agent/handler.mjs.
 *
 * This module must stay free of three.js imports so it is safe to load during
 * server-side rendering and from the offline fallback path.
 */

export type SkillName =
  | 'wave'
  | 'wave_both'
  | 'nod'
  | 'walk_to'
  | 'run'
  | 'come_here'
  | 'turn'
  | 'spin'
  | 'point'
  | 'high_five'
  | 'pick_up'
  | 'put_down'
  | 'throw'
  | 'kick'
  | 'jump'
  | 'crouch'
  | 'sit'
  | 'stand'
  | 'balance'
  | 'dance'
  | 'reset';

export type PlanStep = {skill: SkillName; params?: Record<string, string>};

export type Plan = {plan: PlanStep[]; say: string};

/** Manual skill buttons shown under the scene. */
export const SKILL_BUTTONS: {label: string; step: PlanStep}[] = [
  {label: '👋 Wave', step: {skill: 'wave'}},
  {label: '🙌 Wave both', step: {skill: 'wave_both'}},
  {label: '🖐️ High-five', step: {skill: 'high_five'}},
  {label: '🚶 Walk to cube', step: {skill: 'walk_to', params: {target: 'cube'}}},
  {label: '🏃 Run to cube', step: {skill: 'run', params: {target: 'cube'}}},
  {label: '📦 Pick up cube', step: {skill: 'pick_up', params: {target: 'cube'}}},
  {label: '🤾 Throw cube', step: {skill: 'throw'}},
  {label: '🦵 Kick cube', step: {skill: 'kick'}},
  {label: '👇 Put down', step: {skill: 'put_down'}},
  {label: '🦘 Jump', step: {skill: 'jump'}},
  {label: '↺ Turn left', step: {skill: 'turn', params: {direction: 'left'}}},
  {label: '🌀 Spin', step: {skill: 'spin'}},
  {label: '👉 Point right', step: {skill: 'point', params: {target: 'right'}}},
  {label: '🙇 Nod', step: {skill: 'nod'}},
  {label: '🪑 Sit', step: {skill: 'sit'}},
  {label: '🧍 Stand', step: {skill: 'stand'}},
  {label: '⚖️ Balance', step: {skill: 'balance'}},
  {label: '💃 Dance', step: {skill: 'dance'}},
  {label: '🔄 Reset', step: {skill: 'reset'}},
];

export const EXAMPLE_COMMANDS = [
  'run to the cube, pick it up, and throw it',
  'walk to the cube and kick it',
  'jump, spin, then wave with both hands',
  'come here and give me a high five',
];

const KNOWN = new Set<SkillName>([
  'wave',
  'wave_both',
  'nod',
  'walk_to',
  'run',
  'come_here',
  'turn',
  'spin',
  'point',
  'high_five',
  'pick_up',
  'put_down',
  'throw',
  'kick',
  'jump',
  'crouch',
  'sit',
  'stand',
  'balance',
  'dance',
  'reset',
]);

/** Normalise a target word into one the scene understands. */
function readTarget(text: string): string {
  if (/\bcube|box|block\b/.test(text)) return 'cube';
  if (/\bleft\b/.test(text)) return 'left';
  if (/\bright\b/.test(text)) return 'right';
  if (/\bforward|ahead|straight|here|me\b/.test(text)) return 'forward';
  if (/\bcenter|centre|middle|back\b/.test(text)) return 'center';
  return 'forward';
}

/** Parse a single clause into zero or more plan steps. */
function parseClause(raw: string): PlanStep[] {
  const t = raw.toLowerCase().trim();
  if (!t) return [];

  if (/\breset\b/.test(t)) return [{skill: 'reset'}];
  if (/\bhigh[- ]?five\b/.test(t)) return [{skill: 'high_five'}];
  if (/\bthrow|toss|chuck\b/.test(t)) return [{skill: 'throw'}];
  if (/\bkick\b/.test(t)) return [{skill: 'kick'}];
  if (/\b(pick|grab|lift|take)\b/.test(t)) {
    return [{skill: 'pick_up', params: {target: 'cube'}}];
  }
  if (/\b(put down|drop|release|place)\b/.test(t)) return [{skill: 'put_down'}];
  if (/\b(jump|hop|leap)\b/.test(t)) return [{skill: 'jump'}];
  if (/\bspin\b/.test(t)) return [{skill: 'spin'}];
  if (/\bwave\b/.test(t) || /\b(hi|hello|hey)\b/.test(t)) {
    return /\bboth|two|2\b/.test(t) ? [{skill: 'wave_both'}] : [{skill: 'wave'}];
  }
  if (/\bnod|yes\b/.test(t)) return [{skill: 'nod'}];
  if (/\bdance\b/.test(t)) return [{skill: 'dance'}];
  if (/\bsit\b/.test(t)) return [{skill: 'sit'}];
  if (/\b(stand|get up|stand up)\b/.test(t)) return [{skill: 'stand'}];
  if (/\bbalance\b/.test(t)) return [{skill: 'balance'}];
  if (/\b(crouch|squat|kneel)\b/.test(t)) return [{skill: 'crouch'}];
  if (/\bpoint\b/.test(t)) return [{skill: 'point', params: {target: readTarget(t)}}];
  if (/\brotate\b/.test(t) || /\bturn\b/.test(t)) {
    const direction = /\bright\b/.test(t) ? 'right' : 'left';
    return [{skill: 'turn', params: {direction}}];
  }
  if (/\bcome\b/.test(t)) return [{skill: 'come_here'}];
  if (/\b(run|sprint|dash)\b/.test(t)) {
    return [{skill: 'run', params: {target: readTarget(t)}}];
  }
  if (/\b(walk|go|move|head)\b/.test(t)) {
    return [{skill: 'walk_to', params: {target: readTarget(t)}}];
  }
  return [];
}

/**
 * Offline fallback: turn a natural-language command into a plan using keyword
 * rules. Used when the AI endpoint is unavailable or returns an empty plan, so
 * the robot still "works" with no API key.
 */
export function parseCommandLocal(text: string): Plan {
  const clauses = text.split(/\bthen\b|,|;|\band\b|\./gi);
  const plan: PlanStep[] = [];
  for (const clause of clauses) {
    for (const step of parseClause(clause)) plan.push(step);
  }
  return {
    plan,
    say: plan.length
      ? 'Running your command locally (no AI key configured).'
      : "I couldn't map that to a movement — try “walk to the cube and wave”.",
  };
}

/** Validate/clean a plan coming back from the AI endpoint. */
export function sanitizePlan(input: unknown): PlanStep[] {
  if (!Array.isArray(input)) return [];
  const out: PlanStep[] = [];
  for (const step of input) {
    if (step && typeof step === 'object' && KNOWN.has((step as PlanStep).skill)) {
      const s = step as PlanStep;
      out.push({skill: s.skill, params: s.params ?? {}});
    }
  }
  return out;
}
