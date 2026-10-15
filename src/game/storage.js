const KEYS = { scores: 'pictureConnect.scores.v1', config: 'pictureConnect.config.v1' };
export const DEFAULT_CONFIG = Object.freeze({ muted: false, questionCount: 5, timeScale: 1, idleEnabled: true, idleSeconds: 45 });

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch { return fallback; }
}

export function loadConfig() {
  const stored = read(KEYS.config, {});
  return {
    muted: Boolean(stored.muted),
    questionCount: clamp(Number(stored.questionCount) || 5, 5, 10),
    timeScale: [0.8, 1, 1.25].includes(Number(stored.timeScale)) ? Number(stored.timeScale) : 1,
    idleEnabled: stored.idleEnabled !== false,
    idleSeconds: clamp(Number(stored.idleSeconds) || 45, 15, 300)
  };
}

export function saveConfig(config) {
  try { localStorage.setItem(KEYS.config, JSON.stringify(config)); } catch { /* Private mode can reject storage. */ }
}

export function loadScores() {
  const value = read(KEYS.scores, []);
  if (!Array.isArray(value)) return [];
  return value.filter((row) => typeof row?.name === 'string' && Number.isFinite(row?.score))
    .sort((a, b) => b.score - a.score).slice(0, 20);
}

export function saveScore(name, score) {
  const scores = [...loadScores(), { name: String(name).slice(0, 16), score: Math.max(0, Number(score) || 0), date: new Date().toISOString() }]
    .sort((a, b) => b.score - a.score).slice(0, 20);
  try { localStorage.setItem(KEYS.scores, JSON.stringify(scores)); } catch { /* Game remains playable. */ }
  return { scores, rank: scores.findIndex((row) => row.name === String(name).slice(0, 16) && row.score === score) + 1 };
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
