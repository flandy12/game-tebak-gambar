export class SoundManager {
  constructor(muted = false) { this.muted = muted; this.context = null; }
  setMuted(value) { this.muted = Boolean(value); }
  unlock() {
    if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)();
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
  }
  play(type) {
    if (this.muted) return;
    try {
      this.unlock();
      const patterns = {
        tap: [[520, 0.035, 0]],
        correct: [[523, 0.09, 0], [659, 0.09, 0.09], [784, 0.16, 0.18]],
        wrong: [[220, 0.08, 0], [165, 0.15, 0.09]],
        timeout: [[350, 0.12, 0], [260, 0.18, 0.13]],
        countdown: [[440, 0.08, 0]],
        go: [[660, 0.08, 0], [880, 0.15, 0.08]]
      };
      (patterns[type] || patterns.tap).forEach(([frequency, duration, delay]) => {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = type === 'wrong' ? 'sawtooth' : 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.001, this.context.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.1, this.context.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + delay + duration);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start(this.context.currentTime + delay);
        oscillator.stop(this.context.currentTime + delay + duration + 0.02);
      });
    } catch { /* Audio is optional. */ }
  }
}
