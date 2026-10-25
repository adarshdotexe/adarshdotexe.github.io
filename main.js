// Quiet motion: staggered reveals, one honest counter, a bar that notices scrolling.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('y').textContent = new Date().getFullYear();

  // Frosted bar gets a hairline once you leave the top.
  const bar = document.querySelector('.bar');
  const onScroll = () => bar.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Stagger siblings that reveal together.
  const items = [...document.querySelectorAll('.reveal')];
  const groups = new Map();
  for (const el of items) {
    const p = el.parentElement;
    const i = groups.get(p) ?? 0;
    el.style.setProperty('--d', `${Math.min(i, 6) * 60}ms`);
    groups.set(p, i + 1);
  }

  // The counter: 1m 45s down to 600 ms, once.
  const counter = document.querySelector('.counter');
  const fmt = (s) => (s >= 1 ? `${s.toFixed(1)} s` : `${Math.round(s * 1000)} ms`);
  const runCounter = () => {
    if (!counter || counter.dataset.ran) return;
    counter.dataset.ran = '1';
    if (reduce) return counter.classList.add('done');
    const from = +counter.dataset.from, to = +counter.dataset.to, dur = 1600;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4); // ease-out quart: fast, then settles
      counter.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(tick);
      else { counter.textContent = '600 ms'; counter.classList.add('done'); }
    };
    requestAnimationFrame(tick);
  };

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    runCounter();
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add('in');
        if (en.target.contains(counter)) setTimeout(runCounter, 350);
        io.unobserve(en.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  // Highlight the section you're reading.
  const links = [...document.querySelectorAll('.links a')];
  const spy = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
})();
