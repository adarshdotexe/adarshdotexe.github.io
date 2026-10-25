// adarsh.exe: router + screen swaps, the motion layer (GSAP, loaded only when motion is welcome),
// rotator, disclosures, wheel, drift, copy, form, bat-signal, analytics.
const doc = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const mobile = matchMedia("(max-width: 1023px)");
const finePointer = matchMedia("(pointer: fine)");
const announce = (msg) => { const a = $("#announce"); if (!a) return; a.textContent = ""; setTimeout(() => (a.textContent = msg), 30); };
const shown = (el) => el.offsetParent !== null || el.getClientRects().length > 0;

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

/* ---------- collapsibles (node toggles); height animates when the motion layer is in ---------- */
function setOpen(btn, open, animate = true) {
  const region = document.getElementById(btn.getAttribute("aria-controls"));
  if (!region) return;
  btn.setAttribute("aria-expanded", String(open));
  const label = open ? btn.dataset.openLabel : btn.dataset.closedLabel;
  if (label) btn.setAttribute("aria-label", label);
  btn.closest(".work")?.classList.toggle("is-open", open);
  if (!(animate && motion())) {
    if (open) region.removeAttribute("data-closed"); else region.setAttribute("data-closed", "");
    return;
  }
  gsap.killTweensOf(region);
  if (open) {
    region.removeAttribute("data-closed");
    gsap.fromTo(region, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out", clearProps: "height,opacity" });
    const art = $$(".art", region);
    if (art.length) gsap.from(art, { scale: 0.9, rotation: -3, duration: 0.6, delay: 0.08, ease: "back.out(1.6)", clearProps: "transform" });
  } else {
    gsap.to(region, { height: 0, opacity: 0, duration: 0.32, ease: "power2.inOut", onComplete: () => { region.setAttribute("data-closed", ""); gsap.set(region, { clearProps: "height,opacity" }); } });
  }
}
for (const region of $$("[data-collapsible]")) if (!region.hasAttribute("data-open")) region.setAttribute("data-closed", "");
for (const btn of $$(".node-toggle[aria-controls]")) btn.addEventListener("click", () => setOpen(btn, btn.getAttribute("aria-expanded") !== "true"));
function openRegion(id) { const btn = $(`.node-toggle[aria-controls="${id}"]`); if (btn) setOpen(btn, true, false); }

/* ---------- screen entrances ---------- */
const splits = new Map();
function titleWords(panel) {
  const title = $(".title", panel);
  if (!title || !SplitText) return [];
  if (!splits.has(title)) splits.set(title, SplitText.create(title, { type: "words", mask: "words", wordsClass: "w" }));
  return splits.get(title).words;
}
function inView(el) { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }
function enter(panel, dir = 1, fromHome = false) {
  if (!motion() || !panel) return null;
  const tl = gsap.timeline();
  tl.from(panel, { opacity: 0, x: 28 * dir, duration: 0.42, clearProps: "opacity,transform" }, 0);
  const words = titleWords(panel);
  if (words.length) tl.from(words, { yPercent: 110, duration: 0.55, stagger: 0.07, clearProps: "transform" }, 0.04);
  const items = $$(".lede, .title-block, .tile, .tl-item, .rows > li, .meters > li, .disclose", panel).filter((el) => shown(el) && inView(el)).slice(0, 12);
  if (items.length) tl.from(items, { y: 18, opacity: 0, duration: 0.45, stagger: 0.045, clearProps: "opacity,transform" }, 0.1);
  const art = $$(".art", panel).filter((el) => shown(el) && inView(el)).slice(0, 8);
  if (art.length) tl.from(art, { scale: 0.78, rotation: -7, duration: 0.65, stagger: 0.07, ease: "back.out(1.6)", clearProps: "transform" }, 0.16);
  const fills = $$(".meter-fill", panel).filter(inView);
  if (fills.length) tl.from(fills, { scaleX: 0, duration: 0.8, stagger: 0.06, ease: "power2.inOut", clearProps: "transform" }, 0.3);
  const card = $(".frame > .card");
  if (fromHome && card && shown(card)) {
    tl.from(card, { opacity: 0, x: -28, duration: 0.45, clearProps: "opacity,transform" }, 0)
      .from($(".photo", card), { scale: 0.8, rotation: -8, duration: 0.6, ease: "back.out(1.8)", clearProps: "transform" }, 0.08)
      .from($$(".card-name, .card-role, .status, .socials a", card), { y: 10, opacity: 0, duration: 0.4, stagger: 0.04, clearProps: "opacity,transform" }, 0.14);
  }
  if (panel.id === "home") homeIn(tl, 0.05, true);
  return tl;
}

/* Home: disc, photo, name, script, chips and orbit objects, in that order */
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
    .from(".eyebrow", { opacity: 0, x: -14, duration: 0.4, clearProps: "opacity,transform" }, at + 0.12 * k);
  if (chars.length) tl.from(chars, { yPercent: 115, duration: 0.6, stagger: 0.028 }, at + 0.18);
  else tl.from(name, { opacity: 0, y: 14, duration: 0.45, clearProps: "opacity,transform" }, at + 0.1);
  tl.from(".rotor", { opacity: 0, duration: 0.25, clearProps: "opacity" }, at + 0.5 * k)
    .from(".statement", { opacity: 0, y: 14, duration: 0.5, clearProps: "opacity,transform" }, at + 0.58 * k)
    .from(".actions .btn", { opacity: 0, y: 14, duration: 0.45, stagger: 0.08, clearProps: "opacity,transform" }, at + 0.68 * k)
    .from(".stat", { opacity: 0, y: -22, duration: 0.6, stagger: 0.12, ease: "back.out(2.2)", clearProps: "opacity,transform" }, at + 0.5 * k)
    .from(".ho-orbit > g", { opacity: 0, scale: 0, transformOrigin: "50% 50%", duration: 0.55, stagger: 0.09, ease: "back.out(1.8)" }, at + 0.3 * k)
    .from(".ho-orbit > path", { opacity: 0, duration: 0.5 }, at + 0.9 * k)
    .from(".proof", { opacity: 0, y: 18, duration: 0.5, clearProps: "opacity,transform" }, at + 0.82 * k)
    .from(".proof-art", { scale: 0.55, rotation: -25, duration: 0.65, ease: "back.out(2)", clearProps: "transform" }, at + 0.95 * k);
  return tl;
}

/* ---------- router + swap ---------- */
const panels = $$(".panel[id]");
const order = panels.map((p) => p.id);
let current = doc.dataset.route || "home";
let swapTl = null;

function markNav(route) {
  for (const a of $$(".rail-link")) {
    if (a.dataset.route === route) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
}

function afterRoute(hash) {
  const [, sub] = String(hash).replace(/^#\/?/, "").split("/");
  const key = String(hash).replace(/^#\/?/, "").split("/")[0];
  let target = null;
  if (sub) { const work = document.getElementById(sub); if (work) { const btn = $(".node-toggle", work); if (btn) setOpen(btn, true, false); target = work; } }
  if (key === "blog" || key === "writing") { openRegion("blog-more"); target = $("#blog"); }
  if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "auto" }));
}

function show(route, { focus = true, quick = false, hash = "" } = {}) {
  const panel = document.getElementById(route);
  if (!panel) return;
  if (swapTl) { swapTl.progress(1); swapTl.kill(); swapTl = null; }
  if (route === current) { afterRoute(hash); if (focus) focusHeading(panel); return; }
  const out = document.getElementById(current);
  const dir = order.indexOf(route) < order.indexOf(current) ? -1 : 1;
  const fromHome = current === "home";
  doc.dataset.dir = dir < 0 ? "back" : "fwd";
  const update = () => {
    doc.dataset.route = route;
    current = route;
    markNav(route);
    document.title = panel.dataset.title || document.title;
    panel.scrollTop = 0;
    if (mobile.matches) window.scrollTo(0, 0);
    panel.classList.add("is-filled");
    afterRoute(hash);
    if (focus) focusHeading(panel);
  };
  if (!motion()) {
    update();
    if (!reduced.matches) { panel.classList.remove("swap-in"); void panel.offsetWidth; panel.classList.add("swap-in"); }
    return;
  }
  // outgoing slides away, the layout switches while nothing is visible, then the new screen arrives
  swapTl = gsap.timeline({ onComplete: () => { swapTl = null; } });
  if (out) swapTl.to(out, { opacity: 0, x: -24 * dir, duration: 0.2, ease: "power2.in" });
  swapTl.call(() => {
    if (out) gsap.set(out, { clearProps: "opacity,transform" });
    update();
    const tl = enter(panel, dir, fromHome && route !== "home");
    if (tl) swapTl.add(tl, ">");
  });
  if (quick) swapTl.timeScale(1.5);
}
function focusHeading(panel) { $("[tabindex='-1']", panel)?.focus({ preventScroll: true }); }

let pendingQuick = false;
if (panels.length) {
  markNav(current);
  document.title = document.getElementById(current)?.dataset.title || document.title;
  document.getElementById(current)?.classList.add("is-filled");
  if (mobile.matches) window.scrollTo(0, 0);
  afterRoute(location.hash);
  window.addEventListener("load", () => { if (mobile.matches && !location.hash.includes("/") && !/blog|writing/.test(location.hash)) window.scrollTo(0, 0); }, { once: true });

  window.addEventListener("hashchange", () => {
    const route = window.routeOf(location.hash);
    if (route) show(route, { hash: location.hash, quick: pendingQuick });
    pendingQuick = false;
  });

  const step = (d) => {
    const i = (order.indexOf(current) + d + order.length) % order.length;
    location.hash = order[i];
  };
  // ← / → swap screens, but not while focus is on a control or a link
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.target.closest("a, button, input, textarea, select, summary, [contenteditable]")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      pendingQuick = true;
      step(e.key === "ArrowRight" ? 1 : -1);
    }
  });

  // skip link: focus the visible panel's heading
  $(".skip")?.addEventListener("click", (e) => { e.preventDefault(); focusHeading(document.getElementById(current)); });

  // mobile: the identity card lives at the top of About
  const card = $(".card"), slot = $(".card-slot"), frame = $(".frame");
  const placeCard = () => { if (!card || !slot) return; if (mobile.matches) slot.append(card); else frame.prepend(card); };
  placeCard();
  mobile.addEventListener("change", placeCard);
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

/* ---------- identity bar: tighten after 24 px of scroll ---------- */
const bar = $(".idbar");
if (bar) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { bar.classList.toggle("is-tight", window.scrollY > 24); ticking = false; });
  }, { passive: true });
}

/* ---------- rotator: types and erases in the hand, one full loop, ending back on Batman ---------- */
let rollStarted = false;
function startRoll(already = false) {
  const roll = $(".roll[data-roll]");
  if (!roll || rollStarted || reduced.matches) return;
  rollStarted = true;
  const text = $(".roll-text", roll);
  const words = ["Batman", ...roll.dataset.roll.split("|"), "Batman"];
  const rotor = roll.closest(".rotor");
  let paused = false;
  rotor.addEventListener("pointerenter", () => (paused = true));
  rotor.addEventListener("pointerleave", () => (paused = false));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const idle = async () => { while (paused || document.hidden || current !== "home") await wait(250); };
  const type = async (word) => { for (let i = 1; i <= word.length; i++) { text.textContent = word.slice(0, i); await wait(55 + Math.random() * 40); } };
  const erase = async () => { while (text.textContent.length) { text.textContent = text.textContent.slice(0, -1); await wait(28); } };
  (async () => {
    roll.classList.add("is-typing");
    if (!already) { text.textContent = ""; await type(words[0]); }
    for (let i = 1; i < words.length; i++) {
      await wait(2600);
      await idle();
      await erase();
      await wait(180);
      await type(words[i]);
    }
    await wait(1200);
    roll.classList.remove("is-typing");
  })();
}

/* ---------- wheel over the card or the backdrop scrolls the visible panel (desktop) ---------- */
window.addEventListener("wheel", (e) => {
  if (mobile.matches || e.ctrlKey || doc.hasAttribute("data-bat")) return;
  if (e.target.closest(".stage")) return;
  const panel = $$(".stage .panel").find((p) => p.offsetParent !== null);
  if (!panel) return;
  const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? panel.clientHeight : 1;
  panel.scrollBy({ top: e.deltaY * k, behavior: "auto" });
}, { passive: true });

/* ---------- drift (backdrop follows the pointer, max 12 px) ---------- */
const layer = $(".field-layer");
if (layer && finePointer.matches && !reduced.matches) {
  let x = 0, y = 0, queued = false;
  window.addEventListener("pointermove", (e) => {
    x = (e.clientX / innerWidth - 0.5) * -24;
    y = (e.clientY / innerHeight - 0.5) * -24;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { layer.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`; queued = false; });
  }, { passive: true });
}

/* ---------- toast ---------- */
const toastEl = $(".toast");
let toastTimer;
function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2400);
}

/* ---------- copy email ---------- */
for (const b of $$("[data-copy]")) {
  b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); }
    catch { location.href = `mailto:${b.dataset.copy}`; return; }
    b.classList.remove("is-done"); void b.offsetWidth; b.classList.add("is-done");
    toast("Email copied");
  });
}

/* ---------- contact form ---------- */
const form = $(".form");
if (form) {
  form.noValidate = true;
  const status = $(".form-status", form);
  const send = $("button[type=submit]", form);
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
    send.textContent = "Sending…";
    status.className = "form-status";
    status.textContent = "";
    try {
      const r = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(String(r.status));
      form.reset();
      const photo = $(".card .photo");
      if (photo && !reduced.matches) { photo.classList.remove("is-sent"); void photo.offsetWidth; photo.classList.add("is-sent"); }
      const plane = $(".contact-art img");
      if (plane && motion()) gsap.fromTo(plane, { rotation: 0 }, { rotation: -3, y: -6, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out", clearProps: "transform" });
      status.classList.add("is-ok");
      status.textContent = "Thanks! It’s in my inbox and I’ll get back to you soon.";
    } catch {
      status.classList.add("is-fail");
      status.textContent = "That didn’t go through. Could you email me instead?";
    } finally {
      send.disabled = false;
      send.textContent = "Send";
    }
  });
}

/* ---------- bat-signal: type "batman" or long-press the rotator; Esc or a tap to leave ---------- */
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
  // touch: a long press on the rotator turns it on; any tap turns it off again
  const rotorEl = $(".rotor");
  let hold = null;
  const cancel = () => { clearTimeout(hold); hold = null; };
  rotorEl?.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    cancel();
    hold = setTimeout(() => { hold = null; toggle(!on()); }, 600);
  });
  for (const ev of ["pointerup", "pointercancel", "pointerleave"]) rotorEl?.addEventListener(ev, cancel);
  rotorEl?.addEventListener("contextmenu", (e) => { if (e.pointerType !== "mouse") e.preventDefault(); });
  document.addEventListener("pointerdown", (e) => { if (on() && !e.target.closest(".rotor")) toggle(false); });
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
  for (const img of $$(".panel img[loading='lazy']")) if (!img.closest("[data-closed]")) img.loading = "eager";
}
const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
const afterLoad = () => { idle(analytics, { timeout: 4000 }); setTimeout(() => idle(warm, { timeout: 3000 }), 1500); };
if (document.readyState === "complete") afterLoad();
else window.addEventListener("load", afterLoad, { once: true });
