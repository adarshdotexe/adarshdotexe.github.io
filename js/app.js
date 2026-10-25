// adarsh.exe: router + screen swaps, the motion layer (GSAP, loaded only when motion is welcome),
// rotator, tile toggles, progressive Work list, testimonials scroller, blog filter, clock, copy,
// form, the hidden easter egg, analytics.
const doc = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const mobile = matchMedia("(max-width: 1023px)");
const announce = (msg) => { const a = $("#announce"); if (!a) return; a.textContent = ""; setTimeout(() => (a.textContent = msg), 30); };
const shown = (el) => el.offsetParent !== null || el.getClientRects().length > 0;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- motion layer: GSAP 3 + SplitText from the CDN, never on the critical path ---------- */
const GSAP = "https://cdn.jsdelivr.net/npm/gsap@3.15.0";
let gsap = null;
let SplitText = null;
const motion = () => gsap && !reduced.matches;
const gsapReady = reduced.matches ? Promise.resolve(null) : (async () => {
  try {
    const slow = new Promise((_, no) => setTimeout(() => no(new Error("slow")), 2600));
    const [core, split] = await Promise.race([Promise.all([import(`${GSAP}/+esm`), import(`${GSAP}/SplitText/+esm`)]), slow]);
    gsap = core.gsap || core.default;
    SplitText = split.SplitText || split.default;
    gsap.registerPlugin(SplitText);
    gsap.defaults({ ease: "power3.out", overwrite: "auto" });
    doc.classList.add("gsap");
    return gsap;
  } catch {
    return null;
  }
})();

/* ---------- theme-color follows the palette's --bg (tokens.css) ---------- */
const themeMeta = $('meta[name="theme-color"]');
const bgToken = getComputedStyle(doc).getPropertyValue("--bg").trim();
if (themeMeta && bgToken) themeMeta.setAttribute("content", bgToken);

/* ---------- tile toggles: the whole tile is the button; height animates when the motion layer is in ---------- */
function setOpen(btn, open, animate = true) {
  const region = document.getElementById(btn.getAttribute("aria-controls"));
  if (!region) return;
  if ((btn.getAttribute("aria-expanded") === "true") === open && !region.hasAttribute("data-closed") === open) return;
  btn.setAttribute("aria-expanded", String(open));
  const label = open ? btn.dataset.openLabel : btn.dataset.closedLabel;
  if (label) btn.setAttribute("aria-label", label);
  btn.closest(".tile")?.classList.toggle("is-open", open);
  if (!(animate && motion())) {
    if (open) region.removeAttribute("data-closed"); else region.setAttribute("data-closed", "");
    return;
  }
  gsap.killTweensOf(region);
  if (open) {
    region.removeAttribute("data-closed");
    gsap.fromTo(region, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.42, ease: "power3.out", clearProps: "height,opacity" });
    const inner = $$("p, figure", region);
    if (inner.length) gsap.from(inner, { y: -6, duration: 0.42, stagger: 0.05, ease: "power2.out", clearProps: "transform" });
  } else {
    gsap.to(region, { height: 0, opacity: 0, duration: 0.28, ease: "power2.inOut", onComplete: () => { region.setAttribute("data-closed", ""); gsap.set(region, { clearProps: "height,opacity" }); } });
  }
}
for (const region of $$("[data-collapsible]")) if (!region.hasAttribute("data-open")) region.setAttribute("data-closed", "");
for (const btn of $$(".tile-toggle[aria-controls]")) {
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    // About's What I Do: one open at a time
    const group = btn.closest("[data-accordion]");
    if (open && group) for (const other of $$(".tile-toggle[aria-expanded='true']", group)) if (other !== btn) setOpen(other, false);
    setOpen(btn, open);
  });
}

/* ---------- screen entrances ---------- */
const splits = new Map();
function titleWords(screen) {
  const title = $(".title", screen);
  if (!title || !SplitText) return [];
  if (!splits.has(title)) splits.set(title, SplitText.create(title, { type: "words", mask: "words", wordsClass: "w" }));
  return splits.get(title).words;
}
function inView(el) { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }
function enter(screen, dir = 1, fromHome = false) {
  if (!motion() || !screen) return null;
  const tl = gsap.timeline();
  tl.from(screen, { opacity: 0, x: 24 * dir, duration: 0.4, clearProps: "opacity,transform" }, 0);
  const words = titleWords(screen);
  if (words.length) tl.from(words, { yPercent: 110, duration: 0.55, stagger: 0.07, clearProps: "transform" }, 0.04);
  const items = $$(".lede, .title-block, .filters, .tiles > .tile:not([hidden]), .quote, .skill-chips, .pray, .contact-side > *", screen).filter((el) => shown(el) && inView(el)).slice(0, 12);
  if (items.length) tl.from(items, { y: 16, opacity: 0, duration: 0.45, stagger: 0.045, clearProps: "opacity,transform" }, 0.1);
  const art = $$(".thumb, .clock-card .dial", screen).filter((el) => shown(el) && inView(el)).slice(0, 8);
  if (art.length) tl.from(art, { scale: 0.82, rotation: -5, duration: 0.6, stagger: 0.06, ease: "back.out(1.7)", clearProps: "transform" }, 0.16);
  const fills = $$(".meter-fill", screen).filter(inView);
  if (fills.length) tl.from(fills, { scaleX: 0, duration: 0.8, ease: "power2.inOut", clearProps: "transform" }, 0.3);
  const col = $(".id");
  if (fromHome && col && shown(col)) {
    tl.from(col, { opacity: 0, x: -24, duration: 0.42, clearProps: "opacity,transform" }, 0)
      .from($(".photo", col), { scale: 0.8, rotation: -8, duration: 0.6, ease: "back.out(1.8)", clearProps: "transform" }, 0.08)
      .from($$(".id-name, .id-role, .id-place, .social", col), { y: 10, opacity: 0, duration: 0.4, stagger: 0.04, clearProps: "opacity,transform" }, 0.14);
  }
  if (screen.id === "home") homeIn(tl, 0.05, true);
  return tl;
}

/* Home: disc, photo, name, script, meta and orbit objects, in that order */
function homeIn(tl, at = 0, quick = false) {
  const home = $("#home");
  const k = quick ? 0.6 : 1;
  const name = $(".hero-name", home);
  let chars = [];
  if (!quick && SplitText) {
    const split = SplitText.create($$(".first, .last", name), { type: "chars", mask: "chars", charsClass: "c" });
    chars = split.chars;
    tl.eventCallback("onComplete", () => split.revert());
  }
  tl.from(".ho-discg", { scale: 0.85, svgOrigin: "320 330", duration: 0.7 * k, ease: "back.out(1.6)" }, at)
    .from(".hero-photo", { scale: 0.9, duration: 0.6 * k, ease: "back.out(1.8)", clearProps: "transform" }, at + 0.08 * k)
    .from(".greet", { opacity: 0, x: -14, duration: 0.4, clearProps: "opacity,transform" }, at + 0.12 * k);
  if (chars.length) tl.from(chars, { yPercent: 115, duration: 0.6, stagger: 0.028 }, at + 0.18);
  else tl.from(name, { opacity: 0, y: 14, duration: 0.45, clearProps: "opacity,transform" }, at + 0.1);
  tl.from(".rotor", { opacity: 0, duration: 0.25, clearProps: "opacity" }, at + 0.5 * k)
    .from(".intro-line", { opacity: 0, y: 14, duration: 0.5, clearProps: "opacity,transform" }, at + 0.58 * k)
    .from(".meta-item", { opacity: 0, y: 10, duration: 0.45, stagger: 0.07, clearProps: "opacity,transform" }, at + 0.66 * k)
    .from(".actions .btn", { opacity: 0, y: 14, duration: 0.45, stagger: 0.08, clearProps: "opacity,transform" }, at + 0.76 * k)
    .from(".ho-orbit > g", { opacity: 0, scale: 0, transformOrigin: "50% 50%", duration: 0.55, stagger: 0.09, ease: "back.out(1.8)" }, at + 0.3 * k)
    .from(".ho-orbit > path", { opacity: 0, duration: 0.5 }, at + 0.9 * k);
  return tl;
}

/* ---------- router + swap ---------- */
const screens = $$(".stage > .screen[id]");
const order = screens.map((p) => p.id);
let current = doc.dataset.route || "home";
let swapTl = null;

function markNav(route) {
  for (const a of $$(".rail-link")) {
    if (a.dataset.route === route) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
}

// deep links: #portfolio/<tile-id> opens that tile (revealing the Work list up to it)
function afterRoute(hash) {
  const sub = String(hash).replace(/^#\/?/, "").split("/")[1];
  if (!sub) return;
  const tile = document.getElementById(sub);
  if (!tile || !tile.classList.contains("tile")) return;
  if (tile.hidden) revealUpTo(tile);
  const btn = $(".tile-toggle", tile);
  if (btn) setOpen(btn, true, false);
  requestAnimationFrame(() => tile.scrollIntoView({ block: "center", behavior: "auto" }));
}

function show(route, { focus = true, quick = false, hash = "" } = {}) {
  const screen = document.getElementById(route);
  if (!screen) return;
  if (swapTl) { swapTl.progress(1); swapTl.kill(); swapTl = null; }
  if (route === current) { afterRoute(hash); if (focus) focusHeading(screen); return; }
  const out = document.getElementById(current);
  const dir = order.indexOf(route) < order.indexOf(current) ? -1 : 1;
  const fromHome = current === "home";
  doc.dataset.dir = dir < 0 ? "back" : "fwd";
  const update = () => {
    doc.dataset.route = route;
    current = route;
    markNav(route);
    document.title = screen.dataset.title || document.title;
    window.scrollTo(0, 0);
    screen.classList.add("is-filled");
    afterRoute(hash);
    if (focus) focusHeading(screen);
    onScreen(route);
  };
  if (!motion()) {
    update();
    if (!reduced.matches) { screen.classList.remove("swap-in"); void screen.offsetWidth; screen.classList.add("swap-in"); }
    return;
  }
  // outgoing slides away, the layout switches while nothing is visible, then the new screen arrives
  swapTl = gsap.timeline({ onComplete: () => { swapTl = null; } });
  if (out) swapTl.to(out, { opacity: 0, x: -20 * dir, duration: 0.2, ease: "power2.in" });
  swapTl.call(() => {
    if (out) gsap.set(out, { clearProps: "opacity,transform" });
    update();
    const tl = enter(screen, dir, fromHome && route !== "home");
    if (tl) swapTl.add(tl, ">");
  });
  if (quick) swapTl.timeScale(1.5);
}
function focusHeading(screen) { $("[tabindex='-1']", screen)?.focus({ preventScroll: true }); }

let pendingQuick = false;
if (screens.length) {
  markNav(current);
  document.title = document.getElementById(current)?.dataset.title || document.title;
  document.getElementById(current)?.classList.add("is-filled");
  queueMicrotask(() => afterRoute(location.hash));

  window.addEventListener("hashchange", () => {
    const route = window.routeOf(location.hash);
    if (route) show(route, { hash: location.hash, quick: pendingQuick });
    pendingQuick = false;
  });

  const step = (d) => {
    const i = (order.indexOf(current) + d + order.length) % order.length;
    location.hash = order[i];
  };
  // ← / → swap screens, but not while focus is on a control, a link or the scroller
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.target.closest("a, button, input, textarea, select, summary, [contenteditable], .quotes, .tip")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      pendingQuick = true;
      step(e.key === "ArrowRight" ? 1 : -1);
    }
  });

  // skip link: focus the visible screen's heading
  $(".skip")?.addEventListener("click", (e) => { e.preventDefault(); focusHeading(document.getElementById(current)); });
}

/* ---------- first paint: the Home intro, or nothing (content is already visible) ---------- */
gsapReady.then(() => {
  clearTimeout(window.__introT);
  const intro = doc.classList.contains("intro");
  if (intro && motion() && current === "home") {
    const tl = gsap.timeline({ delay: 0.05 });
    const t = $(".roll-text");
    if (t) t.textContent = "";
    doc.classList.remove("intro");
    homeIn(tl, 0);
    tl.call(startRoll, null, 0.55);
  } else {
    doc.classList.remove("intro");
    startRoll(true);
  }
});

/* ---------- identity bar (mobile): a rule appears after 24 px of scroll ---------- */
const bar = $(".idbar");
if (bar) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { bar.classList.toggle("is-tight", window.scrollY > 24); ticking = false; });
  }, { passive: true });
}

/* ---------- rotator: types and erases in the hand, one full loop, back to the first title ---------- */
let rollStarted = false;
function startRoll(already = false) {
  const roll = $(".roll[data-roll]");
  if (!roll || rollStarted || reduced.matches) return;
  rollStarted = true;
  const text = $(".roll-text", roll);
  const first = "AI Tooling Builder";
  const words = [first, ...roll.dataset.roll.split("|"), first];
  const rotor = roll.closest(".rotor");
  let paused = false;
  rotor.addEventListener("pointerenter", () => (paused = true));
  rotor.addEventListener("pointerleave", () => (paused = false));
  const idle = async () => { while (paused || document.hidden || current !== "home") await wait(250); };
  const type = async (word) => { for (let i = 1; i <= word.length; i++) { text.textContent = word.slice(0, i); await wait(55 + Math.random() * 40); } };
  const erase = async () => { while (text.textContent.length) { text.textContent = text.textContent.slice(0, -1); await wait(26); } };
  (async () => {
    roll.classList.add("is-typing");
    if (!already) { text.textContent = ""; await type(words[0]); }
    for (let i = 1; i < words.length; i++) {
      await wait(2400);
      await idle();
      await erase();
      await wait(180);
      await type(words[i]);
    }
    await wait(1200);
    roll.classList.remove("is-typing");
  })();
}

/* ---------- Work: progressive ("virtual") loading; without JS every tile renders ---------- */
const works = $$(".works > .work");
const loader = $(".loader");
const sentinel = $(".sentinel");
const workStatus = $("#work-status");
const FIRST = 5, BATCH = 4;
let visibleCount = works.length;
let loading = false;
let io = null;
const setStatus = () => {
  if (!workStatus) return;
  workStatus.textContent = visibleCount < works.length
    ? `Showing ${visibleCount} of ${works.length} projects. More load as you scroll or tab.`
    : `Showing all ${works.length} projects.`;
};
function reveal(n, animate = true) {
  const next = works.slice(visibleCount, visibleCount + n);
  next.forEach((w, i) => {
    w.hidden = false;
    if (animate && !reduced.matches) { w.style.setProperty("--i", i); w.classList.add("is-new"); w.addEventListener("animationend", () => w.classList.remove("is-new"), { once: true }); }
  });
  visibleCount += next.length;
  setStatus();
  if (visibleCount >= works.length) { if (loader) loader.hidden = true; io?.disconnect(); }
}
function revealUpTo(tile) {
  const i = works.indexOf(tile);
  if (i >= visibleCount) reveal(i + 1 - visibleCount, false);
}
async function loadMore() {
  if (loading || visibleCount >= works.length) return;
  loading = true;
  loader?.classList.add("is-loading");
  if (!reduced.matches) await wait(420);
  reveal(BATCH);
  loader?.classList.remove("is-loading");
  loading = false;
  // keep going while the end of the list is still in view (tall screens)
  requestAnimationFrame(() => { if (sentinel && current === "portfolio" && inView(sentinel)) loadMore(); });
}
function scrollParent(el) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}
if (works.length > FIRST && sentinel) {
  works.slice(FIRST).forEach((w) => (w.hidden = true));
  visibleCount = FIRST;
  if (loader) loader.hidden = false;
  setStatus();
  io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting) && current === "portfolio") loadMore(); }, { root: scrollParent(sentinel), rootMargin: "0px 0px 80px 0px" });
  io.observe(sentinel);
  // keyboard: when focus reaches the last visible tile, the next batch is appended
  $(".works")?.addEventListener("focusin", (e) => {
    const tile = e.target.closest(".work");
    if (tile && works.indexOf(tile) === visibleCount - 1) loadMore();
  });
}
function onScreen(route) {
  if (route === "portfolio" && sentinel && visibleCount < works.length) requestAnimationFrame(() => { if (inView(sentinel)) loadMore(); });
  if (route === "about-me") updateScrollBtns();
  if (route === "contact") tick();
}

/* ---------- testimonials: arrow buttons scroll one card; no autoplay ---------- */
const quotes = $(".quotes");
const qBtns = $(".scroll-btns");
function updateScrollBtns() {
  if (!quotes || !qBtns) return;
  const scrollable = quotes.scrollWidth > quotes.clientWidth + 4;
  qBtns.hidden = !scrollable;
  if (!scrollable) return;
  const [prev, next] = $$("button", qBtns);
  prev.disabled = quotes.scrollLeft < 4;
  next.disabled = quotes.scrollLeft + quotes.clientWidth > quotes.scrollWidth - 4;
}
if (quotes && qBtns) {
  for (const b of $$("button", qBtns)) {
    b.addEventListener("click", () => {
      const card = $(".quote", quotes);
      const step = card ? card.getBoundingClientRect().width + 16 : 300;
      quotes.scrollBy({ left: Number(b.dataset.scroll) * step, behavior: reduced.matches ? "auto" : "smooth" });
    });
  }
  quotes.addEventListener("scroll", () => requestAnimationFrame(updateScrollBtns), { passive: true });
  window.addEventListener("resize", updateScrollBtns);
  updateScrollBtns();
}

/* ---------- blog: category chips filter the cards (none pressed shows everything) ---------- */
const filters = $$(".filter");
const posts = $$(".posts > .post");
for (const f of filters) {
  f.addEventListener("click", () => {
    const on = f.getAttribute("aria-pressed") !== "true";
    for (const g of filters) g.setAttribute("aria-pressed", String(g === f && on));
    const cat = on ? f.dataset.filter : null;
    const changed = [];
    for (const p of posts) {
      const hide = !!cat && p.dataset.cat !== cat;
      if (p.hidden !== hide) { p.hidden = hide; if (!hide) changed.push(p); }
    }
    if (motion() && changed.length) gsap.from(changed, { y: 12, opacity: 0, duration: 0.35, stagger: 0.05, clearProps: "opacity,transform" });
    const n = posts.filter((p) => !p.hidden).length;
    announce(`${n} ${n === 1 ? "card" : "cards"} shown`);
  });
}

/* ---------- clock: live Hyderabad time, 12-hour, lowercase am/pm, hands on the dial ---------- */
const clockText = $(".clock-text");
const handH = $(".hand-h"), handM = $(".hand-m");
let lastMin = -1, turnsH = 0, turnsM = 0;
function tick() {
  if (!clockText) return;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour").value), m = Number(parts.find((p) => p.type === "minute").value);
  if (m === lastMin) return;
  // hands only ever move forward (no backward spin at 12)
  const degM = m * 6, degH = (h % 12) * 30 + m * 0.5;
  if (lastMin !== -1 && degM < (turnsM % 360)) turnsM += 360 - (turnsM % 360) + degM; else turnsM = Math.floor(turnsM / 360) * 360 + degM;
  if (lastMin !== -1 && degH < (turnsH % 360)) turnsH += 360 - (turnsH % 360) + degH; else turnsH = Math.floor(turnsH / 360) * 360 + degH;
  lastMin = m;
  const h12 = h % 12 || 12, ap = h < 12 ? "am" : "pm";
  const time = `${h12}:${String(m).padStart(2, "0")} ${ap}`;
  clockText.innerHTML = h < 6
    ? `It’s <time>${time}</time> in Hyderabad, so I’m probably asleep (or halfway through a horror movie).`
    : `It’s <time>${time}</time> in Hyderabad right now.`;
  if (handH) handH.style.transform = `rotate(${turnsH}deg)`;
  if (handM) handM.style.transform = `rotate(${turnsM}deg)`;
}
if (clockText) {
  tick();
  setInterval(() => { if (!document.hidden) tick(); }, 10000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
}

/* ---------- copy email: the copy icon turns into a tick ---------- */
for (const b of $$("[data-copy]")) {
  const label = $(".copy-label", b);
  let t;
  b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); }
    catch { location.href = `mailto:${b.dataset.copy}`; return; }
    b.classList.add("is-done");
    if (label) label.textContent = "Copied";
    announce("Copied");
    clearTimeout(t);
    t = setTimeout(() => { b.classList.remove("is-done"); if (label) label.textContent = "Copy"; }, 2200);
  });
}

/* ---------- contact form ---------- */
const form = $(".form");
if (form) {
  form.noValidate = true;
  const status = $(".form-status", form);
  const send = $("button[type=submit]", form);
  const sendLabel = $(".send-label", send);
  const check = (input) => {
    const err = document.getElementById(input.getAttribute("aria-describedby"));
    const bad = !input.value.trim() || (input.type === "email" && !input.validity.valid);
    input.setAttribute("aria-invalid", String(bad));
    if (err) err.textContent = bad ? err.dataset.msg : "";
    return !bad;
  };
  const inputs = $$(".input", form);
  for (const i of inputs) i.addEventListener("blur", () => { if (i.value) check(i); });
  for (const i of inputs) i.addEventListener("input", () => { if (i.getAttribute("aria-invalid") === "true") check(i); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = inputs.filter((i) => !check(i));
    if (bad.length) { bad[0].focus(); if (motion()) gsap.fromTo(bad[0], { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1.2, 0.3)", clearProps: "transform" }); return; }
    send.disabled = true;
    sendLabel.textContent = "Sending…";
    status.className = "form-status";
    status.textContent = "";
    if (!reduced.matches) { send.classList.remove("is-flying"); void send.offsetWidth; send.classList.add("is-flying"); }
    try {
      const r = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(String(r.status));
      form.reset();
      const art = $(".clock-art");
      if (art && motion()) gsap.fromTo(art, { rotation: 0 }, { rotation: -3, y: -6, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out", clearProps: "transform" });
      status.classList.add("is-ok");
      status.textContent = "Thanks! It’s in my inbox and I’ll get back to you soon.";
    } catch {
      status.classList.add("is-fail");
      status.textContent = "That didn’t go through. Could you email me instead?";
    } finally {
      send.disabled = false;
      sendLabel.textContent = "Send message";
    }
  });
}

/* ---------- hidden easter egg: type "batman"; Esc or a click to leave ---------- */
const bat = $(".bat");
if (bat) {
  let buffer = "";
  const art = $(".bat-art", bat);
  const on = () => doc.hasAttribute("data-bat");
  const toggle = (state) => {
    if (state) {
      if (art && art.dataset.src) { art.src = art.dataset.src; delete art.dataset.src; }
      doc.setAttribute("data-bat", "");
      if (motion() && art) gsap.fromTo(art, { scale: 0.86, y: 24, rotation: -2 }, { scale: 1, y: 0, rotation: 0, duration: 0.7, ease: "back.out(1.6)", clearProps: "transform" });
      announce("Bat-signal on. Press Escape to turn it off.");
    } else {
      doc.removeAttribute("data-bat");
      announce("Bat-signal off.");
    }
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && on()) { toggle(false); return; }
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    if (e.target.closest("input, textarea, select, [contenteditable]")) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-6);
    if (buffer === "batman") { buffer = ""; toggle(!on()); }
  });
  document.addEventListener("pointerdown", () => { if (on()) toggle(false); });
}

/* ---------- analytics, after the page is interactive ---------- */
function analytics() {
  if (location.hostname !== "adarshdotexe.github.io") return;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=G-LJQ15NG321";
  document.head.append(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", "G-LJQ15NG321");
}
/* once the page is idle, warm the other screens' illustrations so a swap never shows an empty frame */
function warm() {
  for (const img of $$(".screen img[loading='lazy']")) if (!img.closest("[data-closed], [hidden]")) img.loading = "eager";
}
const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
const afterLoad = () => { idle(analytics, { timeout: 4000 }); setTimeout(() => idle(warm, { timeout: 3000 }), 1500); };
if (document.readyState === "complete") afterLoad();
else window.addEventListener("load", afterLoad, { once: true });
