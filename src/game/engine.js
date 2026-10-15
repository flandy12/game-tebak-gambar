import { normalizeAnswer, hasRequiredLetters } from './input.js';

export const GAME_STATES = Object.freeze({
  IDLE: 'idle', SETUP: 'player_setup', COUNTDOWN: 'countdown', PLAYING: 'playing',
  FEEDBACK: 'feedback', RESULT: 'result'
});

export const VALID_TRANSITIONS = Object.freeze({
  idle: ['player_setup'],
  player_setup: ['idle', 'countdown'],
  countdown: ['idle', 'playing'],
  playing: ['idle', 'feedback'],
  feedback: ['idle', 'playing', 'result'],
  result: ['idle', 'countdown']
});

export function canTransition(from, to) {
  return Boolean(VALID_TRANSITIONS[from]?.includes(to));
}

export function validatePuzzles(puzzles) {
  const errors = [];
  const ids = new Set();
  if (!Array.isArray(puzzles)) return { valid: [], errors: ['Bank soal bukan array.'] };
  const valid = puzzles.filter((puzzle, index) => {
    const before = errors.length;
    const label = puzzle?.id || `index ${index}`;
    if (!puzzle?.id || ids.has(puzzle.id)) errors.push(`${label}: ID kosong atau duplikat.`);
    ids.add(puzzle?.id);
    if (!normalizeAnswer(puzzle?.answer)) errors.push(`${label}: jawaban kosong.`);
    if (!Array.isArray(puzzle?.images) || puzzle.images.length < 2 || puzzle.images.length > 4 || puzzle.images.some((image) => !image?.src || !image?.alt)) errors.push(`${label}: data gambar tidak valid.`);
    if (!hasRequiredLetters(puzzle?.answer, puzzle?.letterPool)) errors.push(`${label}: kumpulan huruf tidak mencukupi.`);
    if (!puzzle?.hint) errors.push(`${label}: hint kosong.`);
    if (!['easy', 'medium', 'hard'].includes(puzzle?.difficulty)) errors.push(`${label}: tingkat kesulitan tidak valid.`);
    if (!Number.isFinite(puzzle?.basePoints) || !Number.isFinite(puzzle?.timeLimit)) errors.push(`${label}: poin atau durasi tidak valid.`);
    return errors.length === before;
  });
  return { valid, errors };
}

export function pickSessionPuzzles(puzzles, count = 5, random = Math.random) {
  const groups = {
    easy: puzzles.filter((p) => p.difficulty === 'easy').sort(() => random() - 0.5),
    medium: puzzles.filter((p) => p.difficulty === 'medium').sort(() => random() - 0.5),
    hard: puzzles.filter((p) => p.difficulty === 'hard').sort(() => random() - 0.5)
  };
  const pattern = count === 5
    ? ['easy', 'easy', 'medium', 'medium', 'hard']
    : Array.from({ length: count }, (_, index) => index < Math.ceil(count * 0.4) ? 'easy' : index < Math.ceil(count * 0.8) ? 'medium' : 'hard');
  const picked = [];
  pattern.forEach((difficulty) => {
    const next = groups[difficulty].shift();
    if (next && !picked.some((item) => item.id === next.id)) picked.push(next);
  });
  return picked;
}

export class GameEngine {
  constructor() { this.reset(); }
  reset() {
    this.state = GAME_STATES.IDLE;
    this.player = '';
    this.puzzles = [];
    this.index = 0;
    this.score = 0;
    this.results = [];
    this.questionResolved = false;
  }
  transition(next) {
    if (!canTransition(this.state, next)) throw new Error(`Transisi tidak valid: ${this.state} → ${next}`);
    this.state = next;
    return this.state;
  }
  start(player, puzzles) {
    this.player = player || 'Tamu';
    this.puzzles = puzzles;
    this.index = 0;
    this.score = 0;
    this.results = [];
    this.questionResolved = false;
  }
  get currentPuzzle() { return this.puzzles[this.index]; }
  resolve(result) {
    if (this.questionResolved || this.state !== GAME_STATES.PLAYING) return false;
    this.questionResolved = true;
    this.results.push({ id: this.currentPuzzle.id, answer: this.currentPuzzle.answer, ...result });
    if (result.correct) this.score += Math.max(0, result.points || 0);
    return true;
  }
  advance() {
    this.index += 1;
    this.questionResolved = false;
    return this.index < this.puzzles.length;
  }
}
