// adarsh.exe: router + swap, roll, rise, collapsibles, theme, clock, drift, copy, form, bat-signal, analytics.
const doc = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const mobile = matchMedia("(max-width: 1023px)");
const finePointer = matchMedia("(pointer: fine)");
const announce = (msg) => { const a = $("#announce"); if (!a) return; a.textContent = ""; setTimeout(() => (a.textContent = msg), 30); };

/* ---------- theme ---------- */
const systemDark = matchMedia("(prefers-color-scheme: dark)");
function stored() { try { return localStorage.getItem("theme"); } catch { return null; } }
function effectiveTheme() { return doc.dataset.theme || (systemDark.matches ? "dark" : "light"); }
function syncTheme() {
  const now = effectiveTheme();
  doc.dataset.themeNow = now;
  for (const b of $$(".theme-toggle")) b.setAttribute("aria-label", now === "dark" ? "Switch to light theme" : "Switch to dark theme");
}
function setTheme(next) {
  const apply = () => { doc.dataset.theme = next; try { localStorage.setItem("theme", next); } catch {} syncTheme(); };
  if (document.startViewTransition && !reduced.matches) document.startViewTransition(apply);
  else apply();
}
for (const b of $$(".theme-toggle")) b.addEventListener("click", () => setTheme(effectiveTheme() === "dark" ? "light" : "dark"));
systemDark.addEventListener("change", () => { if (!stored()) syncTheme(); });
syncTheme();

/* ---------- collapsibles (node toggles) ---------- */
function setOpen(btn, open) {
  const region = document.getElementById(btn.getAttribute("aria-controls"));
  if (!region) return;
  btn.setAttribute("aria-expanded", String(open));
  const label = open ? btn.dataset.openLabel : btn.dataset.closedLabel;
  if (label) btn.setAttribute("aria-label", label);
  if (open) region.removeAttribute("data-closed"); else region.setAttribute("data-closed", "");
  btn.closest(".work")?.classList.toggle("is-open", open);
}
for (const region of $$("[data-collapsible]")) if (!region.hasAttribute("data-open")) region.setAttribute("data-closed", "");
for (const btn of $$(".node-toggle[aria-controls]")) btn.addEventListener("click", () => setOpen(btn, btn.getAttribute("aria-expanded") !== "true"));
function openRegion(id) { const btn = $(`.node-toggle[aria-controls="${id}"]`); if (btn) setOpen(btn, true); }

/* ---------- router + swap ---------- */
const panels = $$(".panel[id]");
const order = panels.map((p) => p.id);
const visited = new Set();
let current = doc.dataset.route || "home";
let running = null;

function rise(panel) {
  if (!panel) return;
  if (visited.has(panel.id)) return;
  visited.add(panel.id);
  if (!reduced.matches) {
    $$("[data-rise]", panel).forEach((el, i) => el.style.setProperty("--i", String(Math.min(i, 5))));
    panel.classList.add("is-rising");
    setTimeout(() => panel.classList.remove("is-rising"), 700);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("is-filled")));
}

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
  if (sub) { const work = document.getElementById(sub); if (work) { const btn = $(".node-toggle", work); if (btn) setOpen(btn, true); target = work; } }
  if (key === "blog" || key === "writing") { openRegion("blog-more"); target = $("#blog"); }
  if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "auto" }));
}

function show(route, { focus = true, quick = false, hash = "" } = {}) {
  const panel = document.getElementById(route);
  if (!panel) return;
  const same = route === current;
  const update = () => {
    doc.dataset.route = route;
    current = route;
    markNav(route);
    document.title = panel.dataset.title || document.title;
    panel.scrollTop = 0;
    if (mobile.matches) window.scrollTo(0, 0);
    rise(panel);
  };
  if (same) { afterRoute(hash); if (focus) focusHeading(panel); return; }
  doc.dataset.dir = order.indexOf(route) < order.indexOf(current) ? "back" : "fwd";
  doc.dataset.swap = quick ? "quick" : "full";
  running?.skipTransition?.();
  if (document.startViewTransition) {
    running = document.startViewTransition(update);
    running.ready.catch(() => {});
    running.finished.catch(() => {}).finally(() => { running = null; });
    running.updateCallbackDone.catch(() => {}).then(() => { afterRoute(hash); if (focus) focusHeading(panel); });
  } else {
    update();
    if (!reduced.matches) { panel.classList.remove("swap-in"); void panel.offsetWidth; panel.classList.add("swap-in"); }
    afterRoute(hash);
    if (focus) focusHeading(panel);
  }
}
function focusHeading(panel) { $("[tabindex='-1']", panel)?.focus({ preventScroll: true }); }

let pendingQuick = false;
if (panels.length) {
  markNav(current);
  document.title = document.getElementById(current)?.dataset.title || document.title;
  rise(document.getElementById(current));
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
  for (const b of $$(".rail-btn[data-step]")) b.addEventListener("click", () => step(Number(b.dataset.step)));
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.target.closest("input, textarea, select, [contenteditable]")) return;
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

/* ---------- roll (home rotator) ---------- */
const roll = $(".roll[data-roll]");
if (roll && !reduced.matches) {
  const words = ["Batman", ...roll.dataset.roll.split("|")];
  roll.textContent = "";
  const items = words.map((w, i) => { const s = document.createElement("span"); s.className = "roll-item" + (i === 0 ? " is-on" : ""); s.textContent = w; roll.append(s); return s; });
  let i = 0, paused = false, steps = 0;
  const rotor = roll.closest(".rotor");
  rotor.addEventListener("pointerenter", () => (paused = true));
  rotor.addEventListener("pointerleave", () => (paused = false));
  // one full loop, ending back on the first word, then it stays put
  setInterval(() => {
    if (paused || document.hidden || current !== "home" || steps >= items.length) return;
    steps++;
    const out = items[i];
    i = (i + 1) % items.length;
    const next = items[i];
    out.classList.remove("is-on", "is-in");
    out.classList.add("is-out");
    next.classList.remove("is-out");
    next.classList.add("is-on", "is-in");
    setTimeout(() => out.classList.remove("is-out"), 450);
  }, 3800);
}

/* ---------- clock (Hyderabad, IST) ---------- */
const clock = $(".clock");
if (clock) {
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
  const tick = () => {
    const t = fmt.format(new Date());
    clock.textContent = `${t} IST`;
    clock.setAttribute("datetime", t);
    clock.setAttribute("aria-label", `Local time in Hyderabad: ${t}`);
    setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
  };
  tick();
}

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
    if (bad.length) { bad[0].focus(); return; }
    send.disabled = true;
    send.textContent = "Sending…";
    status.className = "form-status";
    status.textContent = "";
    try {
      const r = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(String(r.status));
      form.reset();
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

/* ---------- bat-signal: type "batman", Esc to leave ---------- */
const bat = $(".bat");
if (bat) {
  let buffer = "";
  let follow = null;
  const on = () => doc.hasAttribute("data-bat");
  const place = (x, y) => { bat.style.setProperty("--bx", `${x}px`); bat.style.setProperty("--by", `${y}px`); };
  const toggle = (state) => {
    if (state) {
      doc.setAttribute("data-bat", "");
      if (!reduced.matches && finePointer.matches) {
        let px = innerWidth / 2, py = innerHeight * 0.3, q = false;
        place(px, py);
        follow = (e) => { px = e.clientX; py = e.clientY; if (q) return; q = true; requestAnimationFrame(() => { place(px, py); q = false; }); };
        window.addEventListener("pointermove", follow, { passive: true });
      } else {
        bat.style.removeProperty("--bx");
        bat.style.removeProperty("--by");
      }
      announce("Bat-signal on. Press Escape to turn it off.");
    } else {
      doc.removeAttribute("data-bat");
      if (follow) window.removeEventListener("pointermove", follow);
      follow = null;
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
const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
if (document.readyState === "complete") idle(analytics, { timeout: 4000 });
else window.addEventListener("load", () => idle(analytics, { timeout: 4000 }), { once: true });
