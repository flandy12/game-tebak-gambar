import { icon } from './icons.js';
import { normalizeAnswer } from '../game/input.js';

const difficultyLabels = { easy: 'MUDAH', medium: 'MENENGAH', hard: 'SULIT' };

export function renderGameplay({ puzzle, index, total, score, tiles, selected, remaining, muted, revealed = [] }) {
  const answerLength = normalizeAnswer(puzzle.answer).length;
  const cards = puzzle.images.map((image, cardIndex) => `
    <article class="image-card" style="--delay:${cardIndex * 70}ms">
      <svg class="puzzle-image" role="img" aria-label="${image.alt}" viewBox="0 0 96 96" data-image-src="${image.src}"><use href="${image.src}"></use></svg>
      <span>${image.alt.replace(/^Ilustrasi\s+/i, '')}</span>
    </article>`).join('<div class="plus" aria-hidden="true">+</div>');
  const slots = Array.from({ length: answerLength }, (_, slotIndex) => {
    const selection = selected[slotIndex];
    const letter = selection?.letter || (revealed.includes(slotIndex) ? normalizeAnswer(puzzle.answer)[slotIndex] : '');
    return `<button class="answer-slot ${letter ? 'filled' : ''} ${revealed.includes(slotIndex) ? 'revealed' : ''}" data-action="remove-letter" data-slot="${slotIndex}" aria-label="${letter ? `Hapus huruf ${letter}` : `Slot jawaban ${slotIndex + 1}`}">${letter || '<span></span>'}</button>`;
  }).join('');
  const letters = tiles.map((tile) => `<button class="letter-tile" data-action="pick-letter" data-tile="${tile.id}" ${tile.used ? 'disabled' : ''}>${tile.letter}</button>`).join('');
  const timerPercent = Math.max(0, Math.min(100, (remaining / puzzle.adjustedTime) * 100));
  return `
    <main class="screen gameplay-screen" data-screen="playing">
      <header class="game-header">
        <button class="icon-button game-home" data-action="confirm-home" aria-label="Kembali ke beranda">${icon('back')}</button>
        <div class="question-meta"><span>SOAL ${index + 1} / ${total}</span><div class="session-progress"><i style="width:${((index + 1) / total) * 100}%"></i></div></div>
        <div class="score-box"><small>SKOR</small><strong>${score.toLocaleString('id-ID')}</strong></div>
        <button class="icon-button" data-action="toggle-sound" aria-label="${muted ? 'Aktifkan' : 'Matikan'} suara">${icon(muted ? 'mute' : 'volume')}</button>
        <button class="icon-button" data-action="fullscreen" aria-label="Layar penuh">${icon('fullscreen')}</button>
      </header>
      <section class="play-area">
        <div class="puzzle-stage">
          <div class="difficulty-row"><span class="difficulty ${puzzle.difficulty}">${difficultyLabels[puzzle.difficulty]}</span><div class="timer ${timerPercent < 25 ? 'urgent' : ''}"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18"></circle><circle class="timer-ring" cx="22" cy="22" r="18" style="stroke-dashoffset:${113 - (113 * timerPercent / 100)}"></circle></svg><strong id="timer-value">${Math.ceil(remaining)}</strong></div></div>
          <div class="image-row">${cards}</div>
          <p class="microcopy">Gabungkan gambar menjadi satu kata atau frasa</p>
        </div>
        <div class="answer-stage">
          <div class="answer-slots" id="answer-slots">${slots}</div>
          <div class="letter-pool" id="letter-pool">${letters}</div>
          <p class="game-message" id="game-message" aria-live="polite"></p>
          <div class="game-actions">
            <button class="tool-button" data-action="hint">${icon('bulb')}<span>HINT<small>-25 POIN</small></span></button>
            <button class="tool-button" data-action="clear">${icon('trash')}<span>HAPUS</span></button>
            <button class="primary-button answer-button" data-action="submit" ${selected.length < answerLength ? 'disabled' : ''}>${icon('check')} JAWAB</button>
            <button class="tool-button skip-button" data-action="skip">${icon('skip')}<span>LEWATI</span></button>
          </div>
        </div>
      </section>
    </main>`;
}

export function renderFeedback({ correct, answer, points, reason }) {
  const title = correct ? 'TEPAT SEKALI!' : reason === 'timeout' ? 'WAKTU HABIS' : 'SOAL DILEWATI';
  const iconMark = correct ? '✓' : '⌛';
  return `<div class="feedback-overlay ${correct ? 'success' : 'timeout'}" role="status"><div class="feedback-card"><div class="feedback-icon">${iconMark}</div><p>${title}</p><h2>${answer}</h2>${correct ? `<strong>+${points} POIN</strong>` : '<span>Belum ada poin kali ini</span>'}</div></div>`;
}
