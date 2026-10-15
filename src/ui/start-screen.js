import { icon } from './icons.js';

export function renderAttract({ highScore, config }) {
  return `
    <main class="screen attract-screen" data-screen="idle">
      <div class="orb orb-one"></div><div class="orb orb-two"></div>
      <nav class="top-actions" aria-label="Kontrol aplikasi">
        <button class="icon-button" data-action="toggle-sound" aria-label="${config.muted ? 'Aktifkan' : 'Matikan'} suara">${icon(config.muted ? 'mute' : 'volume')}</button>
        <button class="icon-button" data-action="fullscreen" aria-label="Layar penuh">${icon('fullscreen')}</button>
        <button class="icon-button" data-action="open-settings" aria-label="Pengaturan">${icon('settings')}</button>
      </nav>
      <section class="attract-copy">
        <div class="brand-mark" aria-hidden="true"><span>🖼</span><i></i><span>💡</span></div>
        <p class="eyebrow">ARCADE WORD PUZZLE</p>
        <h1><span>PICTURE</span> CONNECT</h1>
        <p class="tagline">Hubungkan Gambar, Temukan Kata!</p>
        <div class="attract-buttons">
          <button class="primary-button hero-button" data-action="start">${icon('play', 30)} MULAI BERMAIN</button>
          <button class="secondary-button" data-action="how-to">${icon('help')} CARA BERMAIN</button>
        </div>
        <div class="high-score">${icon('trophy', 22)} SKOR TERTINGGI <strong>${highScore.toLocaleString('id-ID')}</strong></div>
      </section>
      <p class="attract-footer">Sentuh layar untuk mulai • Bisa dimainkan tanpa internet</p>
    </main>`;
}

export function renderSetup({ nickname = '' }) {
  return `
    <main class="screen setup-screen" data-screen="player_setup">
      <button class="back-button" data-action="home" aria-label="Kembali">${icon('back')} Beranda</button>
      <section class="setup-card panel">
        <div class="step-pill">LANGKAH 1 DARI 1</div>
        <div class="avatar-bubble">👋</div>
        <h2>Siapa nama pemainnya?</h2>
        <p>Namamu akan tampil di hasil permainan.</p>
        <label class="nickname-field">
          <span>NICKNAME</span>
          <input id="nickname" maxlength="16" autocomplete="off" inputmode="text" placeholder="Ketik nama kamu" value="${escapeHtml(nickname)}" />
          <small><b id="name-count">${nickname.length}</b>/16</small>
        </label>
        <p class="form-error" id="name-error" role="alert"></p>
        <button class="primary-button wide" data-action="continue">LANJUT ${icon('play')}</button>
        <button class="text-button" data-action="guest">Main sebagai Tamu</button>
      </section>
    </main>`;
}

export function renderCountdown(value) {
  return `<main class="screen countdown-screen" data-screen="countdown"><p>BERSIAP!</p><div class="countdown-value" aria-live="assertive">${value}</div><span>Fokus pada gambarnya</span></main>`;
}

export function renderHowTo() {
  return `<div class="modal-backdrop" data-modal="how-to"><section class="modal panel" role="dialog" aria-modal="true" aria-labelledby="how-title">
    <button class="modal-close" data-action="close-modal" aria-label="Tutup">×</button>
    <p class="eyebrow">CARA BERMAIN</p><h2 id="how-title">Sambungkan petunjuk visual</h2>
    <div class="how-grid">
      <article><b>1</b><span>Amati 2–4 gambar yang tampil.</span></article>
      <article><b>2</b><span>Sentuh huruf untuk menyusun jawaban.</span></article>
      <article><b>3</b><span>Jawab cepat untuk bonus hingga 50 poin.</span></article>
    </div>
    <p class="modal-note">Hint membuka satu huruf dan mengurangi 25 poin. Lima soal bergerak dari mudah ke menantang.</p>
    <button class="primary-button wide" data-action="close-modal">MENGERTI!</button>
  </section></div>`;
}

export function renderSettings(config) {
  return `<div class="modal-backdrop" data-modal="settings"><section class="modal panel settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <button class="modal-close" data-action="close-modal" aria-label="Tutup">×</button>
    <p class="eyebrow">MODE BOOTH</p><h2 id="settings-title">Pengaturan permainan</h2>
    <label class="setting-row"><span><b>Jumlah soal</b><small>5–10 soal per sesi</small></span><input id="setting-count" type="number" min="5" max="10" value="${config.questionCount}"></label>
    <label class="setting-row"><span><b>Kecepatan timer</b><small>Pengali durasi tiap soal</small></span><select id="setting-speed"><option value="0.8" ${config.timeScale === 0.8 ? 'selected' : ''}>Cepat</option><option value="1" ${config.timeScale === 1 ? 'selected' : ''}>Normal</option><option value="1.25" ${config.timeScale === 1.25 ? 'selected' : ''}>Santai</option></select></label>
    <label class="setting-row"><span><b>Kembali otomatis</b><small>Reset result setelah waktu idle</small></span><input id="setting-idle" type="checkbox" ${config.idleEnabled ? 'checked' : ''}></label>
    <label class="setting-row"><span><b>Idle timeout</b><small>Detik sebelum kembali ke beranda</small></span><input id="setting-idle-seconds" type="number" min="15" max="300" value="${config.idleSeconds}"></label>
    <button class="primary-button wide" data-action="save-settings">SIMPAN PENGATURAN</button>
  </section></div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
