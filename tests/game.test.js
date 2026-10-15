import { describe, expect, it } from 'vitest';
import puzzles from '../src/data/puzzles.json';
import { calculateScore } from '../src/game/scoring.js';
import { normalizeAnswer, hasRequiredLetters } from '../src/game/input.js';
import { canTransition, GameEngine, GAME_STATES, pickSessionPuzzles, validatePuzzles } from '../src/game/engine.js';

describe('scoring', () => {
  it('adds proportional time bonus and hint penalty', () => {
    expect(calculateScore({ difficulty: 'easy', remainingTime: 15, timeLimit: 30, hintsUsed: 1 })).toBe(100);
    expect(calculateScore({ difficulty: 'hard', remainingTime: 20, timeLimit: 20, hintsUsed: 0 })).toBe(250);
  });
  it('never returns a negative score', () => {
    expect(calculateScore({ basePoints: 10, remainingTime: 0, timeLimit: 20, hintsUsed: 9 })).toBe(0);
  });
});

describe('answer input', () => {
  it('normalizes spaces, punctuation, case, and accents', () => {
    expect(normalizeAnswer('  Kaca-máta! ')).toBe('KACAMATA');
  });
  it('verifies duplicate letter counts', () => {
    expect(hasRequiredLetters('MATA', 'MATAX')).toBe(true);
    expect(hasRequiredLetters('MATA', 'MTAX')).toBe(false);
  });
});

describe('puzzle bank', () => {
  it('contains 30 valid, unique puzzles', () => {
    const validation = validatePuzzles(puzzles);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toHaveLength(30);
    expect(new Set(validation.valid.map((p) => p.id)).size).toBe(30);
  });
  it('picks five unique puzzles in progressive difficulty', () => {
    const selected = pickSessionPuzzles(puzzles, 5, () => 0.5);
    expect(selected.map((p) => p.difficulty)).toEqual(['easy', 'easy', 'medium', 'medium', 'hard']);
    expect(new Set(selected.map((p) => p.id)).size).toBe(5);
  });
});

describe('state transitions and double scoring guard', () => {
  it('allows only declared transitions', () => {
    expect(canTransition(GAME_STATES.IDLE, GAME_STATES.SETUP)).toBe(true);
    expect(canTransition(GAME_STATES.IDLE, GAME_STATES.PLAYING)).toBe(false);
  });
  it('resolves a question only once', () => {
    const engine = new GameEngine();
    engine.transition(GAME_STATES.SETUP);
    engine.start('Tester', [puzzles[0]]);
    engine.transition(GAME_STATES.COUNTDOWN);
    engine.transition(GAME_STATES.PLAYING);
    expect(engine.resolve({ correct: true, points: 125 })).toBe(true);
    expect(engine.resolve({ correct: true, points: 125 })).toBe(false);
    expect(engine.score).toBe(125);
  });
});
