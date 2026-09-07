/** Progressive motion: readable before JS, with scoped observers disposed on navigation. */
let dispose: (() => void) | undefined;

export function initProjectDetail() {
  dispose?.();
  const root = document.querySelector<HTMLElement>('.case-detail');
  if (!root) return;
  const controller = new AbortController();
  const { signal } = controller;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const animations = new Set<Animation>();
  const tweens = new Set<{ kill(): void }>();
  let paused = false;
  let frame = 0;
  const button = root.querySelector<HTMLButtonElement>('.case-motion-toggle')!;
  const updateMotion = () => {
    const off = paused || reduced.matches;
    root.dataset.motion = off ? 'off' : 'on';
    button.setAttribute('aria-pressed', String(off));
    button.textContent = off ? button.dataset.resume! : button.dataset.pause!;
    button.disabled = reduced.matches;
    if (off) {
      animations.forEach(animation => animation.cancel());
      tweens.forEach(tween => tween.kill());
      root.querySelectorAll<HTMLElement>('[data-reveal], [data-title], .case-prose > *').forEach(element => {
        element.style.removeProperty('opacity');
        element.style.removeProperty('transform');
      });
    }
  };
  button.hidden = false;
  button.addEventListener('click', () => { paused = !paused; updateMotion(); }, { signal });
  reduced.addEventListener('change', updateMotion, { signal });
  updateMotion();
  root.dataset.ready = 'true';

  const reveal = (element: HTMLElement, delay = 0) => {
    if (root.dataset.motion === 'off') return;
    const gsap = (window as unknown as { gsap?: { fromTo(target: HTMLElement, from: object, to: object): { kill(): void } } }).gsap;
    if (gsap) {
      const tween = gsap.fromTo(element, { opacity: 0, y: coarse.matches ? 10 : 24 }, {
        opacity: 1, y: 0, duration: .65, delay: delay / 1000, ease: 'power2.out', clearProps: 'opacity,transform',
        onComplete: () => tweens.delete(tween),
      });
      tweens.add(tween);
      return;
    }
    const animation = element.animate([
      { opacity: 0, transform: `translateY(${coarse.matches ? 10 : 24}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 650, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal(entry.target as HTMLElement);
      observer.unobserve(entry.target);
    });
  }, { threshold: .08 });
  root.querySelectorAll<HTMLElement>('[data-reveal], .case-prose > *').forEach(element => observer.observe(element));
  reveal(root.querySelector<HTMLElement>('[data-title]')!, document.documentElement.hasAttribute('data-lab-client-arrival') ? 760 : 100);
  const artwork = root.querySelector<HTMLElement>('.case-art-scene');
  const artObserver = new IntersectionObserver(entries => {
    if (artwork) artwork.dataset.visible = String(entries[0].isIntersecting);
  });
  if (artwork) artObserver.observe(artwork);

  const links = [...root.querySelectorAll<HTMLAnchorElement>('.case-toc a')];
  const chapters = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))));
  const prose = root.querySelector<HTMLElement>('.case-prose')!;
  const progress = root.querySelector<HTMLElement>('.case-read-progress i')!;
  const updateReading = () => {
    frame = 0;
    let active = 0;
    chapters.forEach((chapter, index) => { if (chapter && chapter.getBoundingClientRect().top <= innerHeight * .3) active = index; });
    links.forEach((link, index) => index === active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    const bounds = prose.getBoundingClientRect();
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, (innerHeight * .3 - bounds.top) / Math.max(1, bounds.height - innerHeight * .5)))})`;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(updateReading); };
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { passive: true, signal });
  updateReading();
  dispose = () => {
    controller.abort();
    observer.disconnect();
    artObserver.disconnect();
    cancelAnimationFrame(frame);
    animations.forEach(animation => animation.cancel());
    tweens.forEach(tween => tween.kill());
  };
  document.addEventListener('astro:before-swap', () => dispose?.(), { once: true, signal });
}
