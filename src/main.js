import './styles/main.css';
import puzzlesData from './data/puzzles.json';
import { GameEngine, GAME_STATES, validatePuzzles, pickSessionPuzzles } from './game/engine.js';
import { GameTimer } from './game/timer.js';
import { normalizeAnswer, createLetterTiles } from './game/input.js';
import { calculateScore } from './game/scoring.js';
import { loadConfig, saveConfig, loadScores, saveScore } from './game/storage.js';
import { SoundManager } from './game/sound.js';
import { renderAttract, renderSetup, renderCountdown, renderHowTo, renderSettings } from './ui/start-screen.js';
import { renderGameplay, renderFeedback } from './ui/gameplay-screen.js';
import { renderResult } from './ui/result-screen.js';
import { burstConfetti } from './ui/effects.js';

const app = document.querySelector('#app');
const engine = new GameEngine();
const config = loadConfig();
const sound = new SoundManager(config.muted);
const validation = validatePuzzles(puzzlesData);
let tiles = [];
let selected = [];
let revealed = [];
let hintsUsed = 0;
let remaining = 0;
let idleTimeoutId = null;
let transitionTimeoutId = null;
let countdownIds = [];
let rank = 1;
let lastNickname = '';
let renderingQuestion = false;
const assetChecks = new Map();

const timer = new GameTimer({
  onTick: (time) => {
    remaining = time;
    const number = document.querySelector('#timer-value');
    if (number) number.textContent = Math.ceil(time);
    const ring = document.querySelector('.timer-ring');
    if (ring && engine.currentPuzzle) {
      const percent = Math.max(0, Math.min(1, time / engine.currentPuzzle.adjustedTime));
      ring.style.strokeDashoffset = 113 - (113 * percent);
      ring.closest('.timer')?.classList.toggle('urgent', percent < 0.25);
    }
  },
  onExpire: () => resolveQuestion({ correct: false, points: 0, reason: 'timeout' })
});

function renderHome() {
  clearAsync();
  engine.reset();
  const scores = loadScores();
  app.innerHTML = renderAttract({ highScore: scores[0]?.score || 0, config });
}

function startSetup() {
  if (engine.state === GAME_STATES.IDLE) engine.transition(GAME_STATES.SETUP);
  app.innerHTML = renderSetup({ nickname: lastNickname });
  if (config.idleEnabled) idleTimeoutId = window.setTimeout(renderHome, config.idleSeconds * 1000);
  window.setTimeout(() => document.querySelector('#nickname')?.focus(), 120);
}

function beginSession(name) {
  const picked = pickSessionPuzzles(validation.valid, config.questionCount).map((puzzle) => ({
    ...puzzle,
    adjustedTime: Math.max(10, Math.round(puzzle.timeLimit * config.timeScale))
  }));
  engine.start(name, picked);
  engine.transition(GAME_STATES.COUNTDOWN);
  runCountdown();
}

function runCountdown() {
  clearAsync(false);
  const frames = [{ label: '3', delay: 0 }, { label: '2', delay: 750 }, { label: '1', delay: 1500 }, { label: 'GO!', delay: 2250 }];
  frames.forEach(({ label, delay }, index) => {
    countdownIds.push(window.setTimeout(() => {
      app.innerHTML = renderCountdown(label);
      sound.play(index === 3 ? 'go' : 'countdown');
    }, delay));
  });
  countdownIds.push(window.setTimeout(() => {
    if (engine.state !== GAME_STATES.COUNTDOWN) return;
    engine.transition(GAME_STATES.PLAYING);
    prepareQuestion();
  }, 3000));
}

function prepareQuestion() {
  renderingQuestion = true;
  timer.stop();
  const puzzle = engine.currentPuzzle;
  tiles = createLetterTiles(puzzle.letterPool);
  selected = [];
  revealed = [];
  hintsUsed = 0;
  remaining = puzzle.adjustedTime;
  renderQuestion();
  validateVisibleImages();
  timer.start(puzzle.adjustedTime);
  renderingQuestion = false;
}

function renderQuestion() {
  const puzzle = engine.currentPuzzle;
  app.innerHTML = renderGameplay({ puzzle, index: engine.index, total: engine.puzzles.length, score: engine.score, tiles, selected, remaining, muted: config.muted, revealed });
}

function refreshInput() {
  if (engine.state !== GAME_STATES.PLAYING) return;
  const focus = document.activeElement?.dataset?.action;
  const puzzle = engine.currentPuzzle;
  const slots = document.querySelector('#answer-slots');
  const pool = document.querySelector('#letter-pool');
  if (!slots || !pool) return;
  const answerLength = normalizeAnswer(puzzle.answer).length;
  slots.innerHTML = Array.from({ length: answerLength }, (_, i) => {
    const choice = selected[i];
    const letter = choice?.letter || (revealed.includes(i) ? normalizeAnswer(puzzle.answer)[i] : '');
    return `<button class="answer-slot ${letter ? 'filled' : ''} ${revealed.includes(i) ? 'revealed' : ''}" data-action="remove-letter" data-slot="${i}" aria-label="${letter ? `Hapus huruf ${letter}` : `Slot jawaban ${i + 1}`}">${letter || '<span></span>'}</button>`;
  }).join('');
  pool.innerHTML = tiles.map((tile) => `<button class="letter-tile" data-action="pick-letter" data-tile="${tile.id}" ${tile.used ? 'disabled' : ''}>${tile.letter}</button>`).join('');
  const submit = document.querySelector('[data-action="submit"]');
  if (submit) submit.disabled = selected.filter(Boolean).length + revealed.length < answerLength;
  if (focus) document.querySelector(`[data-action="${focus}"]`)?.focus({ preventScroll: true });
}

function pickLetter(tileId) {
  const tile = tiles.find((item) => item.id === tileId);
  const answerLength = normalizeAnswer(engine.currentPuzzle.answer).length;
  if (!tile || tile.used || selected.filter(Boolean).length + revealed.length >= answerLength) return;
  const openIndex = Array.from({ length: answerLength }, (_, i) => i).find((i) => !selected[i] && !revealed.includes(i));
  if (openIndex === undefined) return;
  tile.used = true;
  selected[openIndex] = tile;
  sound.play('tap');
  refreshInput();
}

function removeLetter(index) {
  if (revealed.includes(index)) return;
  const tile = selected[index];
  if (!tile) return;
  tile.used = false;
  selected[index] = undefined;
  refreshInput();
}

function clearLetters() {
  selected.forEach((tile) => { if (tile) tile.used = false; });
  selected = [];
  refreshInput();
}

function useHint() {
  if (engine.state !== GAME_STATES.PLAYING || engine.questionResolved) return;
  const answer = normalizeAnswer(engine.currentPuzzle.answer);
  const target = [...answer].findIndex((letter, index) => !revealed.includes(index) && selected[index]?.letter !== letter);
  if (target < 0) return showMessage('Semua huruf sudah tepat. Coba jawab!', 'info');
  if (selected[target]) selected[target].used = false;
  selected[target] = undefined;
  const matchingTile = tiles.find((tile) => !tile.used && tile.letter === answer[target]);
  if (matchingTile) matchingTile.used = true;
  revealed.push(target);
  hintsUsed += 1;
  sound.play('tap');
  refreshInput();
  showMessage(`Huruf ke-${target + 1} dibuka • penalti 25 poin`, 'info');
}

function submitAnswer() {
  if (engine.state !== GAME_STATES.PLAYING || engine.questionResolved) return;
  const puzzle = engine.currentPuzzle;
  const answer = normalizeAnswer(puzzle.answer);
  const input = Array.from({ length: answer.length }, (_, i) => revealed.includes(i) ? answer[i] : selected[i]?.letter || '').join('');
  if (input.length < answer.length) return showMessage('Lengkapi semua huruf dahulu.', 'info');
  if (input !== answer) {
    sound.play('wrong');
    document.querySelector('.answer-slots')?.classList.add('shake');
    showMessage('Belum tepat, coba lagi!', 'error');
    window.setTimeout(() => document.querySelector('.answer-slots')?.classList.remove('shake'), 450);
    return;
  }
  const points = calculateScore({ difficulty: puzzle.difficulty, basePoints: puzzle.basePoints, remainingTime: remaining, timeLimit: puzzle.adjustedTime, hintsUsed });
  resolveQuestion({ correct: true, points, reason: 'correct', hintsUsed });
}

function resolveQuestion(result) {
  if (engine.state !== GAME_STATES.PLAYING || !engine.resolve(result)) return;
  timer.stop();
  engine.transition(GAME_STATES.FEEDBACK);
  document.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  app.insertAdjacentHTML('beforeend', renderFeedback({ ...result, answer: engine.currentPuzzle.answer }));
  sound.play(result.correct ? 'correct' : 'timeout');
  if (result.correct) burstConfetti(app, 38);
  transitionTimeoutId = window.setTimeout(nextQuestion, result.correct ? 1800 : 2200);
}

function nextQuestion() {
  if (engine.state !== GAME_STATES.FEEDBACK) return;
  if (engine.advance()) {
    engine.transition(GAME_STATES.PLAYING);
    prepareQuestion();
  } else {
    engine.transition(GAME_STATES.RESULT);
    showResults();
  }
}

function showResults() {
  const saved = saveScore(engine.player, engine.score);
  rank = Math.max(1, saved.rank);
  const highScore = saved.scores[0]?.score || engine.score;
  app.innerHTML = renderResult({ player: engine.player, score: engine.score, results: engine.results, rank, highScore });
  burstConfetti(app, 72);
  if (config.idleEnabled) idleTimeoutId = window.setTimeout(renderHome, config.idleSeconds * 1000);
}

function showMessage(message, type) {
  const node = document.querySelector('#game-message');
  if (!node) return;
  node.textContent = message;
  node.className = `game-message ${type}`;
}

async function validateVisibleImages() {
  const images = [...document.querySelectorAll('[data-image-src]')];
  await Promise.all(images.map(async (svg) => {
    const src = svg.dataset.imageSrc.split('#')[0];
    try {
      const available = await checkAsset(src);
      if (!available) throw new Error('asset unavailable');
    } catch {
      svg.outerHTML = '<div class="image-fallback" role="img" aria-label="Gambar tidak tersedia">🧩<small>Gambar tidak tersedia</small></div>';
    }
  }));
}

function checkAsset(src) {
  if (!assetChecks.has(src)) {
    assetChecks.set(src, fetch(src).then((response) => response.ok).catch(() => false));
  }
  return assetChecks.get(src);
}

function preflightPuzzleAssets() {
  const sources = new Set(validation.valid.flatMap((puzzle) => puzzle.images.map((image) => image.src.split('#')[0])));
  sources.forEach((src) => checkAsset(src).then((available) => {
    if (!available) console.warn(`Aset puzzle gagal dimuat: ${src}`);
  }));
}

function clearAsync(stopTimer = true) {
  if (stopTimer) timer.stop();
  window.clearTimeout(idleTimeoutId);
  window.clearTimeout(transitionTimeoutId);
  countdownIds.forEach(window.clearTimeout);
  countdownIds = [];
}

function goHome() {
  if (engine.state !== GAME_STATES.IDLE) {
    clearAsync();
    engine.reset();
  }
  renderHome();
}

function confirmHome(button) {
  if (button.dataset.armed === 'true') {
    goHome();
    return;
  }
  button.dataset.armed = 'true';
  showToast('Tekan sekali lagi untuk kembali');
  window.setTimeout(() => delete button.dataset.armed, 1800);
}

function toggleSound() {
  config.muted = !config.muted;
  sound.setMuted(config.muted);
  saveConfig(config);
  if (engine.state === GAME_STATES.IDLE) renderHome();
  else if (engine.state === GAME_STATES.PLAYING) renderQuestion();
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => showToast('Tidak dapat keluar dari layar penuh.'));
  else document.documentElement.requestFullscreen?.().catch(() => showToast('Mode layar penuh tidak didukung browser ini.'));
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.textContent = message; document.body.append(toast);
  window.setTimeout(() => toast.remove(), 2500);
}

app.addEventListener('input', (event) => {
  if (event.target.id === 'nickname') {
    document.querySelector('#name-count').textContent = event.target.value.length;
    if (config.idleEnabled && engine.state === GAME_STATES.SETUP) {
      window.clearTimeout(idleTimeoutId);
      idleTimeoutId = window.setTimeout(renderHome, config.idleSeconds * 1000);
    }
  }
});

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action !== 'toggle-sound') sound.unlock();
  const actions = {
    start: startSetup,
    home: goHome,
    'confirm-home': () => confirmHome(button),
    'how-to': () => app.insertAdjacentHTML('beforeend', renderHowTo()),
    'open-settings': () => app.insertAdjacentHTML('beforeend', renderSettings(config)),
    'close-modal': () => button.closest('.modal-backdrop')?.remove(),
    continue: () => {
      const input = document.querySelector('#nickname');
      const name = input?.value.trim();
      if (!name) { document.querySelector('#name-error').textContent = 'Masukkan nickname atau pilih bermain sebagai tamu.'; input?.focus(); return; }
      lastNickname = name.slice(0, 16); beginSession(lastNickname);
    },
    guest: () => beginSession('Tamu'),
    'toggle-sound': toggleSound,
    fullscreen: toggleFullscreen,
    'pick-letter': () => pickLetter(button.dataset.tile),
    'remove-letter': () => removeLetter(Number(button.dataset.slot)),
    clear: clearLetters,
    hint: useHint,
    submit: submitAnswer,
    skip: () => resolveQuestion({ correct: false, points: 0, reason: 'skipped' }),
    'play-again': () => {
      clearAsync();
      engine.transition(GAME_STATES.COUNTDOWN);
      const picked = pickSessionPuzzles(validation.valid, config.questionCount).map((p) => ({ ...p, adjustedTime: Math.max(10, Math.round(p.timeLimit * config.timeScale)) }));
      engine.start(engine.player, picked); runCountdown();
    },
    'save-settings': () => {
      config.questionCount = Math.min(10, Math.max(5, Number(document.querySelector('#setting-count')?.value) || 5));
      config.timeScale = Number(document.querySelector('#setting-speed')?.value) || 1;
      config.idleEnabled = Boolean(document.querySelector('#setting-idle')?.checked);
      config.idleSeconds = Math.min(300, Math.max(15, Number(document.querySelector('#setting-idle-seconds')?.value) || 45));
      saveConfig(config); button.closest('.modal-backdrop')?.remove(); showToast('Pengaturan tersimpan.');
    }
  };
  actions[action]?.();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && engine.state === GAME_STATES.PLAYING && !renderingQuestion && timer.getRemaining() <= 0) {
    resolveQuestion({ correct: false, points: 0, reason: 'timeout' });
  }
});

window.addEventListener('beforeunload', () => clearAsync());

if (validation.errors.length) console.warn('Puzzle yang diabaikan:', validation.errors);
if (validation.valid.length < 30) console.error('Bank soal valid kurang dari 30 puzzle.');
preflightPuzzleAssets();
renderHome();
