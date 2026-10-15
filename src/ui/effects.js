export function burstConfetti(container = document.body, count = 54) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#57e6ff', '#7657ff', '#ffcf4a', '#ff6e78', '#54e49a'];
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}vw`);
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 280}px`);
    piece.style.setProperty('--delay', `${Math.random() * 0.45}s`);
    piece.style.setProperty('--duration', `${1.4 + Math.random()}s`);
    piece.style.setProperty('--color', colors[i % colors.length]);
    layer.append(piece);
  }
  container.append(layer);
  window.setTimeout(() => layer.remove(), 2700);
}
