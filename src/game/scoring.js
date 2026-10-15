export const BASE_POINTS = Object.freeze({ easy: 100, medium: 150, hard: 200 });

export function calculateScore({ difficulty, basePoints, remainingTime, timeLimit, hintsUsed = 0 }) {
  const base = Number.isFinite(basePoints) ? basePoints : BASE_POINTS[difficulty] || 0;
  const safeLimit = Math.max(1, Number(timeLimit) || 1);
  const safeRemaining = Math.max(0, Math.min(safeLimit, Number(remainingTime) || 0));
  const timeBonus = Math.floor((safeRemaining / safeLimit) * 50);
  const hintPenalty = Math.max(0, Number(hintsUsed) || 0) * 25;
  return Math.max(0, base + timeBonus - hintPenalty);
}
