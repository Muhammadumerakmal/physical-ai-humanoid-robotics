/**
 * A tiny, dependency-free confetti burst using the Web Animations API.
 * Self-contained (no external assets, CSP-safe) and reduced-motion aware.
 */
const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#f59e0b', '#34d399', '#fb7185'];

export function burstConfetti(count = 64): void {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const layer = document.createElement('div');
  layer.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:3000;overflow:hidden';
  document.body.appendChild(layer);

  const vh = window.innerHeight;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    const size = 6 + Math.random() * 7;
    p.style.cssText =
      `position:absolute;top:-12px;left:${Math.random() * 100}%;` +
      `width:${size}px;height:${size * 0.42 + 3}px;` +
      `background:${COLORS[i % COLORS.length]};border-radius:2px;will-change:transform`;
    const dx = (Math.random() * 2 - 1) * 180;
    const dur = 1700 + Math.random() * 1400;
    p.animate(
      [
        {transform: 'translate(0,0) rotate(0deg)', opacity: 1},
        {
          transform: `translate(${dx}px, ${vh + 60}px) rotate(${Math.random() * 720 - 360}deg)`,
          opacity: 1,
        },
      ],
      {duration: dur, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', delay: Math.random() * 250},
    );
    layer.appendChild(p);
  }
  window.setTimeout(() => layer.remove(), 3400);
}
