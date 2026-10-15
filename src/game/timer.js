export class GameTimer {
  constructor({ onTick, onExpire } = {}) {
    this.onTick = onTick || (() => {});
    this.onExpire = onExpire || (() => {});
    this.intervalId = null;
    this.endAt = 0;
    this.duration = 0;
    this.generation = 0;
  }

  start(seconds) {
    this.stop();
    this.duration = Math.max(1, Number(seconds) || 1);
    this.endAt = performance.now() + this.duration * 1000;
    const token = ++this.generation;
    const update = () => {
      if (token !== this.generation) return;
      const remaining = Math.max(0, (this.endAt - performance.now()) / 1000);
      this.onTick(remaining, this.duration);
      if (remaining <= 0) {
        this.stop();
        this.onExpire(token);
      }
    };
    update();
    this.intervalId = window.setInterval(update, 100);
  }

  getRemaining() {
    return Math.max(0, (this.endAt - performance.now()) / 1000);
  }

  stop() {
    if (this.intervalId !== null) window.clearInterval(this.intervalId);
    this.intervalId = null;
    this.generation += 1;
  }
}
