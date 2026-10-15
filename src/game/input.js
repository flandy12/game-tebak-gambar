export function normalizeAnswer(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

export function createLetterTiles(letterPool, random = Math.random) {
  const letters = Array.isArray(letterPool) ? [...letterPool] : [...String(letterPool || '')];
  return letters
    .filter((letter) => /[A-Z0-9]/i.test(letter))
    .map((letter, index) => ({ id: `tile-${index}-${letter}`, letter: letter.toUpperCase(), used: false }))
    .sort(() => random() - 0.5);
}

export function hasRequiredLetters(answer, letterPool) {
  const required = [...normalizeAnswer(answer)].reduce((map, letter) => map.set(letter, (map.get(letter) || 0) + 1), new Map());
  const available = [...(Array.isArray(letterPool) ? letterPool.join('') : String(letterPool || ''))]
    .map((letter) => letter.toUpperCase())
    .reduce((map, letter) => map.set(letter, (map.get(letter) || 0) + 1), new Map());
  return [...required].every(([letter, count]) => (available.get(letter) || 0) >= count);
}
