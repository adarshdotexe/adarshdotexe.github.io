// Quiet machinery. Everything here is optional: the page reads fine without it.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  $('#y').textContent = new Date().getFullYear();

  // Theme: follows the system until you choose. The choice is remembered.
  $('.theme').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    const apply = () => { root.dataset.theme = next; localStorage.setItem('theme', next); };
    if (document.startViewTransition && !reduce) document.startViewTransition(apply); else apply();
  });

  // Header: a hairline appears once you leave the top.
  const bar = $('.bar');
  const onScroll = () => bar.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Local time in Hyderabad, minute precision, tabular.
  const clocks = $$('.clock');
  const tick = () => {
    const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date());
    clocks.forEach((c) => { c.textContent = c.closest('.facts') ? `· ${t} now` : t; });
  };
  tick(); setInterval(tick, 30000);

  // Copy email.
  $$('.copy').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch { return; }
    b.classList.add('done'); b.firstElementChild.textContent = 'Copied';
    setTimeout(() => { b.classList.remove('done'); b.firstElementChild.textContent = 'Copy'; }, 1600);
  }));

  // Hero: the dimension line shrinks once, 175× in spirit (drawn at 16 %: 0.57 % would vanish).
  const fig = $('.wafer-fig');
  if (reduce) fig.classList.add('go'); else setTimeout(() => fig.classList.add('go'), 700);

  // Diagram packets: SMIL keeps running unless paused.
  if (reduce) $$('.diagram svg').forEach((s) => s.pauseAnimations && s.pauseAnimations());

  // Gentle arrival for below-the-fold blocks, staggered within a group.
  const targets = $$('.sec-head, .services li, .numbers li, .case, .also li, .plaques li, .quotes figure, .posts li, .timeline > li, .ledger');
  const fold = innerHeight;
  const groups = new Map();
  targets.forEach((el) => {
    if (el.getBoundingClientRect().top < fold) return;
    const i = groups.get(el.parentElement) ?? 0;
    groups.set(el.parentElement, i + 1);
    el.style.setProperty('--d', `${Math.min(i, 4) * 40}ms`);
    el.classList.add('rv');
  });
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    $$('.rv').forEach((el) => io.observe(el));
  } else $$('.rv').forEach((el) => el.classList.add('in'));

  // The power rail: a copper trace in the left margin with 45° jogs, a via per section.
  // It draws itself as you read and lights the via of the section you're in.
  const svg = $('.rail');
  const NS = 'http://www.w3.org/2000/svg';
  let fg, total = 0, vias = [], ys = [];
  const build = () => {
    svg.innerHTML = '';
    if (getComputedStyle(svg).display === 'none') return;
    const secs = $$('[data-via]');
    const first = secs[0].querySelector('.headline') || secs[0];
    const content = $('main > section').getBoundingClientRect();
    const padL = parseFloat(getComputedStyle($('main > section')).paddingLeft);
    const x = Math.max(14, content.left + scrollX + padL - 36);
    const docH = document.documentElement.scrollHeight;
    svg.setAttribute('height', docH); svg.style.height = docH + 'px';
    ys = secs.map((s, i) => {
      const h = i === 0 ? first : (s.querySelector('h2') || s);
      const r = h.getBoundingClientRect();
      return r.top + scrollY + Math.min(r.height / 2, 28);
    });
    // Path: vertical, with a small 45° step-out before each via and back after (PCB manners).
    let d = `M ${x} ${ys[0]}`;
    ys.slice(1).forEach((y) => { d += ` V ${y - 22} l 8 8 V ${y - 6} l -8 6 V ${y}`; });
    const end = $('.foot').getBoundingClientRect().top + scrollY;
    d += ` V ${end}`;
    const mk = (cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); svg.appendChild(p); return p; };
    mk('bg'); fg = mk('fg');
    total = fg.getTotalLength();
    fg.style.strokeDasharray = `${total}`;
    vias = ys.map((y) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 3.5); c.setAttribute('class', 'via'); svg.appendChild(c); return c; });
    progress();
  };
  const progress = () => {
    if (!fg) return;
    const line = scrollY + innerHeight * 0.45;
    const top = ys[0], bottom = $('.foot').getBoundingClientRect().top + scrollY;
    const k = Math.min(1, Math.max(0, (line - top) / (bottom - top)));
    fg.style.strokeDashoffset = reduce ? 0 : total * (1 - k);
    let here = 0;
    ys.forEach((y, i) => { if (line >= y) here = i; });
    vias.forEach((v, i) => { v.classList.toggle('lit', i < here || reduce); v.classList.toggle('here', i === here); });
    $$('.bar nav a').forEach((a) => a.classList.toggle('active', a.hash && $(a.hash) === $$('[data-via]')[here]));
  };
  addEventListener('scroll', () => requestAnimationFrame(progress), { passive: true });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(build, 50));
  addEventListener('load', build);
})();
