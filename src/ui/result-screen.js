import { icon } from './icons.js';

export function renderResult({ player, score, results, rank, highScore }) {
  const correct = results.filter((result) => result.correct).length;
  const accuracy = results.length ? Math.round((correct / results.length) * 100) : 0;
  return `<main class="screen result-screen" data-screen="result">
    <div class="result-glow"></div>
    <section class="result-wrap">
      <p class="eyebrow">SESI SELESAI</p><h1>KEREN, ${escapeHtml(player)}!</h1><p class="result-subtitle">Kamu berhasil menghubungkan gambar dan kata.</p>
      <div class="result-score panel"><div class="trophy-orb">${icon('trophy', 42)}</div><span>TOTAL SKOR</span><strong>${score.toLocaleString('id-ID')}</strong><small>${score >= highScore && score > 0 ? '🏆 SKOR TERTINGGI BARU!' : `Peringkat lokal #${rank}`}</small></div>
      <div class="stats-row"><article><strong>${correct}/${results.length}</strong><span>JAWABAN BENAR</span></article><article><strong>${accuracy}%</strong><span>AKURASI</span></article><article><strong>#${rank}</strong><span>PERINGKAT LOKAL</span></article></div>
      <div class="result-summary"><h2>Ringkasan Jawaban</h2><div>${results.map((result, i) => `<article class="${result.correct ? 'correct' : 'missed'}"><span>${result.correct ? '✓' : '—'}</span><small>SOAL ${i + 1}</small><b>${result.answer}</b><strong>${result.correct ? `+${result.points}` : '0'}</strong></article>`).join('')}</div></div>
      <div class="result-actions"><button class="primary-button" data-action="play-again">${icon('rotate')} MAIN LAGI</button><button class="secondary-button" data-action="home">KEMBALI KE BERANDA</button></div>
    </section>
  </main>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
