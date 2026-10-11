/* =====================================================
   Portfolio – MD Injmam Khan
   Edit CONFIG below to change contact details & links.
   ===================================================== */
const CONFIG = {
  phoneIntl: "918521773934",              // country code + number, no "+" or spaces
  email: "khaninjmam152@gmail.com",
  linkedin: "https://www.linkedin.com/in/md-injmam-khan-b30834276/",
  // Add your project links here once the repos / demos are public.
  // Leave "" to keep the default (your GitHub repositories page / hidden live button).
  projects: {
    weather: { code: "", live: "" },
    shop:    { code: "", live: "" },
    todo:    { code: "", live: "" }
  }
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- WhatsApp links (prefilled message) ---------- */
$$("[data-wa]").forEach(a => {
  a.href = `https://wa.me/${CONFIG.phoneIntl}?text=${encodeURIComponent(a.dataset.wa)}`;
});

/* ---------- Project links from CONFIG ---------- */
$$("[data-proj]").forEach(a => {
  const url = (CONFIG.projects[a.dataset.proj] || {})[a.dataset.kind];
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; a.hidden = false; }
});

/* ---------- Year ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- Theme ---------- */
const themeBtn = $("#themeBtn");
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  themeBtn.innerHTML = t === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  store.set("theme", t);
  if (window.__flowColors) window.__flowColors();
}
setTheme(store.get("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

/* ---------- Mobile menu ---------- */
const burger = $("#burger"), links = $("#links");
function toggleMenu(open) {
  links.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
}
burger.addEventListener("click", () => toggleMenu(!links.classList.contains("open")));
links.addEventListener("click", e => { if (e.target.closest("a")) toggleMenu(false); });

/* ---------- Scroll: progress bar, nav shadow ---------- */
const bar = $("#progress"), nav = $("#nav");
function onScroll() {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + "%";
  nav.classList.toggle("scrolled", h.scrollTop > 10);
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ---------- Scroll spy ---------- */
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$(".links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

/* ---------- Reveal on scroll ---------- */
const rev = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); rev.unobserve(e.target); }
}), { threshold: .12 });
$$(".reveal").forEach(el => rev.observe(el));

/* ---------- KPI count-up ---------- */
const countObs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, to = +el.dataset.count, dur = 1400, t0 = performance.now();
  countObs.unobserve(el);
  if (reduceMotion) { el.textContent = to; return; }
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * eased);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}), { threshold: .6 });
$$("[data-count]").forEach(el => countObs.observe(el));

/* ---------- Hero SQL console (typing + result) ---------- */
(function sqlConsole() {
  const code = $("#code"), result = $("#result"), run = $("#runBtn");
  const parts = [
    ["-- Who should you hire for a data role?\n", "c"],
    ["SELECT", "k"], [" name, role, skills, status\n"],
    ["FROM", "k"], ["   candidates\n"],
    ["WHERE", "k"], ["  email = "], ["'khaninjmam152@gmail.com'", "s"], ["\n"],
    ["  AND", "k"], ["  open_to_work = "], ["TRUE", "k"], [";"]
  ];
  const chars = parts.flatMap(([t, c]) => [...t].map(ch => [ch, c || ""]));
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function render(n, caret) {
    let html = "", cls = null, buf = "";
    const flush = () => { if (buf) html += cls ? `<span class="${cls}">${esc(buf)}</span>` : esc(buf); buf = ""; };
    for (let i = 0; i < n; i++) { const [ch, c] = chars[i]; if (c !== cls) { flush(); cls = c; } buf += ch; }
    flush();
    code.innerHTML = html + (caret ? '<span class="caret"></span>' : "");
  }
  let timer, busy = false;
  function play() {
    if (busy) return; busy = true; result.hidden = true; clearInterval(timer);
    if (reduceMotion) { render(chars.length); result.hidden = false; busy = false; return; }
    let i = 0;
    timer = setInterval(() => {
      i++; render(i, true);
      if (i >= chars.length) { clearInterval(timer); render(i, false); setTimeout(() => { result.hidden = false; busy = false; }, 350); }
    }, 18);
  }
  run.addEventListener("click", play);
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { setTimeout(play, 500); o.disconnect(); } }, { threshold: .3 }).observe($("#console"));
})();

/* ---------- Hero flowing data lines (canvas) ---------- */
(function flow() {
  const cv = $("#flow"), ctx = cv.getContext("2d");
  let w, h, dpr, strands = [], running = true, mx = 0, colors = ["#2557e8", "#0f9d9d", "#f2b134"];
  window.__flowColors = () => {
    const s = getComputedStyle(document.documentElement);
    colors = [s.getPropertyValue("--blue").trim(), s.getPropertyValue("--teal").trim(), s.getPropertyValue("--amber").trim()];
  };
  window.__flowColors();
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect(); w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = w < 600 ? 12 : 26;
    strands = Array.from({ length: n }, (_, i) => ({
      y: .08 + (i / n) * .84, amp: 14 + Math.random() * 46, f: .003 + Math.random() * .004,
      ph: Math.random() * 6.28, sp: .25 + Math.random() * .5, col: i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
      dot: Math.random(), dv: .0009 + Math.random() * .0016
    }));
  }
  const yAt = (s, x, t) => s.y * h + Math.sin(x * s.f + t * s.sp + s.ph) * s.amp + Math.sin(x * s.f * 2.3 - t * .4) * s.amp * .35 + mx * (s.y - .5) * 24;
  function frame(ms) {
    if (!running) return;
    const t = ms / 1000; ctx.clearRect(0, 0, w, h);
    for (const s of strands) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 12) { const y = yAt(s, x, t); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = colors[s.col]; ctx.globalAlpha = .16; ctx.lineWidth = 1.2; ctx.stroke();
      s.dot = (s.dot + s.dv) % 1; const dx = s.dot * w;
      ctx.globalAlpha = .75; ctx.fillStyle = colors[s.col]; ctx.beginPath(); ctx.arc(dx, yAt(s, dx, t), 2.6, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  size(); addEventListener("resize", size);
  addEventListener("mousemove", e => { mx = e.clientX / innerWidth - .5; }, { passive: true });
  new IntersectionObserver(es => {
    const vis = es[0].isIntersecting;
    if (vis && !running) { running = true; requestAnimationFrame(frame); } else if (!vis) running = false;
  }).observe(cv);
  requestAnimationFrame(frame);
})();

/* ---------- About tabs ---------- */
(function aboutTabs() {
  const info = {
    sql: ["SQL with PostgreSQL", "Data querying, filtering, joins and aggregations to answer business questions."],
    py:  ["Python", "Data analysis with Pandas, data manipulation and exploratory data analysis (EDA)."],
    xl:  ["Microsoft Excel", "Data cleaning, formulas, sorting, filtering and clear reporting."],
    pbi: ["Power BI", "Interactive dashboards, data visualization, data modeling and DAX fundamentals."],
    st:  ["Statistics", "Descriptive statistics, trend analysis and understanding data patterns."]
  };
  const panel = $("#tabpanel"), tabs = $$("[data-tab]");
  function show(k) {
    tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.tab === k));
    panel.innerHTML = `<b>${info[k][0]}</b><br><span>${info[k][1]}</span>`;
    panel.style.animation = "none"; panel.offsetHeight; panel.style.animation = "";
  }
  tabs.forEach(t => t.addEventListener("click", () => show(t.dataset.tab)));
  show("sql");
})();

/* ---------- Filters (skills & projects) ---------- */
function bindFilter(barSel, itemSel) {
  const buttons = $$(`${barSel} button`);
  buttons.forEach(b => b.addEventListener("click", () => {
    buttons.forEach(x => x.classList.toggle("on", x === b));
    $$(itemSel).forEach(it => {
      const show = b.dataset.f === "all" || it.dataset.g === b.dataset.f;
      it.classList.toggle("out", !show);
      if (show) { it.classList.remove("pop"); it.offsetWidth; it.classList.add("pop"); }
    });
  }));
}
bindFilter("#skillFilters", "#skillGrid .skill");
bindFilter("#projFilters", "#projGrid .proj");

/* ---------- Certificates + lightbox ---------- */
const CERTS = [
  { id: "sql", title: "30 Days SQL Micro Course", org: "SkillCourse", date: "17 Sep 2026", code: "SC-FSKFQ0FS1B", img: "assets/certs/sql.webp" },
  { id: "pbi", title: "30 Days Power BI Micro Course", org: "SkillCourse", date: "2026", code: "", img: "assets/certs/powerbi.webp" },
  { id: "xl",  title: "Microsoft Excel Beginners to Advance", org: "SkillCourse", date: "27 Aug 2026", code: "SC-CST94LXYVL", img: "assets/certs/excel.webp" },
  { id: "da",  title: "Data Analytics Course", org: "30 Days Coding", date: "16 Sep 2025", code: "MNDDJHPL", img: "assets/certs/data-analytics.webp" },
  { id: "fe",  title: "Introduction to Front End Development", org: "Simplilearn SkillUP", date: "19 Sep 2025", code: "8992992", img: "assets/certs/frontend.webp" }
];
const lb = { el: $("#lightbox"), img: $("#lbImg"), cap: $("#lbCap"), items: [], i: 0, last: null };
function lbShow() {
  const it = lb.items[lb.i];
  lb.img.src = it.src; lb.img.alt = it.cap; lb.cap.textContent = it.cap;
  lb.img.style.animation = "none"; lb.img.offsetWidth; lb.img.style.animation = "";
  const multi = lb.items.length > 1;
  $("#lbPrev").hidden = $("#lbNext").hidden = !multi;
}
function lbOpen(items, i) {
  lb.items = items; lb.i = i; lb.last = document.activeElement;
  lbShow(); lb.el.hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus();
}
function lbClose() { lb.el.hidden = true; document.body.style.overflow = ""; lb.last && lb.last.focus(); }
const lbStep = d => { lb.i = (lb.i + d + lb.items.length) % lb.items.length; lbShow(); };
$("#lbClose").addEventListener("click", lbClose);
$("#lbPrev").addEventListener("click", () => lbStep(-1));
$("#lbNext").addEventListener("click", () => lbStep(1));
lb.el.addEventListener("click", e => { if (e.target === lb.el) lbClose(); });
addEventListener("keydown", e => {
  if (lb.el.hidden) return;
  if (e.key === "Escape") lbClose();
  if (e.key === "ArrowLeft") lbStep(-1);
  if (e.key === "ArrowRight") lbStep(1);
});

const grid = $("#certGrid");
grid.innerHTML = CERTS.map((c, i) => `
  <button class="cert reveal" data-i="${i}" aria-label="View ${c.title} certificate">
    <div class="cert-img"><img src="${c.img}" alt="${c.title} certificate" loading="lazy" /></div>
    <div class="cert-meta"><h3>${c.title}</h3><p>${c.org} · ${c.date}${c.code ? " · ID " + c.code : ""}</p></div>
  </button>`).join("");
$$("#certGrid .cert").forEach(card => {
  const i = +card.dataset.i, c = CERTS[i], img = $("img", card);
  rev.observe(card);
  img.addEventListener("error", () => {
    c.missing = true;
    $(".cert-img", card).innerHTML = '<div class="cert-ph"><i class="fa-solid fa-award"></i>Certificate is listed on LinkedIn.<br>Select to open it.</div>';
  });
  card.addEventListener("click", () => openCert(c.id));
  // gentle 3D tilt
  card.addEventListener("mousemove", e => {
    if (reduceMotion) return;
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});
function openCert(id) {
  const c = CERTS.find(x => x.id === id);
  if (c.missing) { window.open(CONFIG.linkedin, "_blank", "noopener"); return; }
  const list = CERTS.filter(x => !x.missing).map(x => ({ id: x.id, src: x.img, cap: `${x.title} – ${x.org}, ${x.date}` }));
  lbOpen(list, list.findIndex(x => x.id === id));
}
$$("[data-open-cert]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  const map = { sql: "sql", da: "da", fe: "fe" };
  openCert(map[a.dataset.openCert]);
}));
$$("[data-lightbox]").forEach(b => b.addEventListener("click", () => lbOpen([{ src: b.dataset.lightbox, cap: b.dataset.caption }], 0)));

/* ---------- Contact: copy email + form ---------- */
$("#copyMail").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(CONFIG.email); toast("Email address copied"); }
  catch { toast(CONFIG.email); }
});

const form = $("#contactForm"), err = $("#formErr");
form.addEventListener("submit", e => {
  e.preventDefault();
  const f = { name: $("#fName"), email: $("#fEmail"), subject: $("#fSubject"), msg: $("#fMsg") };
  let bad = [];
  Object.values(f).forEach(i => i.classList.remove("bad"));
  if (!f.name.value.trim()) bad.push(f.name);
  if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) bad.push(f.email);
  if (!f.subject.value.trim()) bad.push(f.subject);
  if (!f.msg.value.trim()) bad.push(f.msg);
  if (bad.length) {
    bad.forEach(i => i.classList.add("bad")); bad[0].focus();
    err.textContent = "Please fill in every field and use a valid email address."; err.hidden = false; return;
  }
  err.hidden = true;
  const v = { n: f.name.value.trim(), e: f.email.value.trim(), s: f.subject.value.trim(), m: f.msg.value.trim() };
  if (e.submitter && e.submitter.dataset.via === "mail") {
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(v.s)}&body=${encodeURIComponent(`${v.m}\n\n– ${v.n} (${v.e})`)}`;
    toast("Opening your email app…");
  } else {
    const text = `Hello Injmam! 👋\n\n*Name:* ${v.n}\n*Email:* ${v.e}\n*Subject:* ${v.s}\n\n*Message:*\n${v.m}`;
    window.open(`https://wa.me/${CONFIG.phoneIntl}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    toast("Opening WhatsApp…");
  }
});
$$("#contactForm input, #contactForm textarea").forEach(i => i.addEventListener("input", () => i.classList.remove("bad")));
