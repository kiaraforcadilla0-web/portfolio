/* motion.js — the extra animation layer
   intro curtain · section-heading scramble + word rise · side dot nav ·
   small context cursor · hero parallax · experience accordion polish */

/* ---------- intro curtain (once per tab session, skippable) ---------- */
KF.module("intro", function (KF) {
  var intro = KF.$(".intro");
  if (!intro) return;
  function done() {
    if (!KF.root.classList.contains("intro-on")) return;
    KF.root.classList.add("intro-out");
    try { sessionStorage.setItem("kf-intro", "1"); } catch (e) {}
    setTimeout(function () { KF.root.classList.remove("intro-on", "intro-out"); }, 600);
  }
  if (!KF.root.classList.contains("intro-on")) return;
  intro.addEventListener("click", done);
  document.addEventListener("keydown", done, { once: true });
  setTimeout(done, 1250);
});

/* ---------- section headings: number scrambles, title words rise ---------- */
KF.module("headings", function (KF) {
  KF.$$(".section__title").forEach(function (title) {
    if (title.dataset.split) return;
    title.dataset.split = "1";
    title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());
    var words = title.textContent.trim().split(/\s+/);
    title.textContent = "";
    words.forEach(function (w, i) {
      var outer = document.createElement("span"); outer.className = "w"; outer.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span"); inner.textContent = w; inner.style.setProperty("--wi", i);
      outer.appendChild(inner); title.appendChild(outer);
      if (i < words.length - 1) title.appendChild(document.createTextNode(" "));
    });
  });
  KF.$$(".section__head").forEach(function (head) {
    var num = KF.$(".section__num", head);
    head.addEventListener("kf:reveal", function () { KF.scramble(num, 650); });
    head.addEventListener("pointerenter", function () { KF.scramble(num, 450); });
    if (head.classList.contains("is-visible") && num) num.textContent = num.dataset.text || num.textContent;
  });
});

/* ---------- side dot navigation (desktop) ---------- */
KF.module("dots", function (KF) {
  var sections = KF.$$("main section[id]");
  if (sections.length < 3) return;
  var nav = document.createElement("nav");
  nav.className = "dots";
  nav.setAttribute("aria-label", "Section shortcuts");
  sections.forEach(function (s) {
    var t = KF.$(".section__title, .lc__title", s);
    var label = s.id === "home" ? "Home" : t ? (t.getAttribute("aria-label") || t.textContent.trim()) : s.id;
    var a = document.createElement("a");
    a.href = "#" + s.id; a.dataset.id = s.id;
    a.innerHTML = '<span class="dots__label"></span>';
    a.firstChild.textContent = label.replace(/\s+/g, " ");
    a.setAttribute("aria-label", label);
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
  var links = KF.$$("a", nav);
  document.addEventListener("kf:section", function (e) {
    links.forEach(function (a) { var on = a.dataset.id === e.detail; a.classList.toggle("is-active", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  });
  /* hide over the hero; show once you start reading */
  KF.onScroll(function (s) { nav.classList.toggle("is-shown", s.y > s.vh * 0.6); });
});

/* ---------- small context cursor (mouse only) ---------- */
KF.module("cursor", function (KF) {
  if (!KF.finePointer || KF.reduceMotion) return;
  var dot = document.createElement("div"), ring = document.createElement("div");
  dot.className = "cursor-dot"; ring.className = "cursor-ring";
  ring.innerHTML = '<span class="cursor-ring__label"></span>';
  dot.setAttribute("aria-hidden", "true"); ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring); document.body.appendChild(dot);
  var label = ring.firstChild;
  var x = -100, y = -100, rx = -100, ry = -100, shown = false;

  document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; rx = x; ry = y; KF.root.classList.add("has-cursor"); }
  }, { passive: true });
  document.addEventListener("pointerleave", function () { shown = false; KF.root.classList.remove("has-cursor"); });
  document.addEventListener("pointerdown", function () { ring.classList.add("is-down"); });
  document.addEventListener("pointerup", function () { ring.classList.remove("is-down"); });

  var HOVER = "a, button, [role='button'], summary, .filter-btn, label";
  document.addEventListener("pointerover", function (e) {
    var t = e.target.closest && e.target.closest(HOVER + ", .portrait__frame, .lc-copy, input, textarea");
    ring.classList.toggle("is-hover", !!t);
    var txt = "";
    if (t) {
      if (t.classList.contains("portrait__frame")) txt = "💡";
      else if (t.classList.contains("lc-copy")) txt = "Copy";
      else if (t.matches("a[target='_blank']")) txt = "Open";
      else if (t.tagName === "SUMMARY") txt = t.parentElement.open ? "Close" : "Open";
    }
    label.textContent = txt;
    ring.classList.toggle("has-label", !!txt);
    ring.classList.toggle("is-text", !t && !!(e.target.closest && e.target.closest("p, li, h1, h2, h3, blockquote")));
  });

  KF.onFrame(function () {
    if (!shown) return;
    rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
    dot.style.transform = "translate(" + x + "px," + y + "px)";
    ring.style.transform = "translate(" + rx + "px," + ry + "px)";
  });
});

/* ---------- hero: background follows the mouse a little ---------- */
KF.module("hero-parallax", function (KF) {
  var hero = KF.$(".hero"), bg = KF.$(".hero__bg");
  if (!hero || !bg || !KF.finePointer || KF.reduceMotion) return;
  var tx = 0, ty = 0, cx = 0, cy = 0, inView = true;
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  hero.addEventListener("pointerleave", function () { tx = ty = 0; });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { inView = e[0].isIntersecting; }).observe(hero);
  KF.onFrame(function () {
    if (!inView) return;
    var nx = cx + (tx - cx) * 0.06, ny = cy + (ty - cy) * 0.06;
    if (Math.abs(nx - cx) < 0.0005 && Math.abs(ny - cy) < 0.0005) return;
    cx = nx; cy = ny;
    bg.style.setProperty("--px", cx.toFixed(3));
    bg.style.setProperty("--py", cy.toFixed(3));
  });
});

/* ---------- experience accordion: smooth open/close height ---------- */
KF.module("accordion", function (KF) {
  if (KF.reduceMotion) return;
  KF.$$(".accordion details").forEach(function (d) {
    var summary = KF.$("summary", d), body = summary && summary.nextElementSibling;
    if (!body) return;
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = "1";
      var opening = !d.open;
      if (opening) d.open = true;
      var h = body.scrollHeight;
      var anim = body.animate(
        opening ? [{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }]
                : [{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
        { duration: 380, easing: "cubic-bezier(.22,1,.36,1)" }
      );
      body.style.overflow = "hidden";
      anim.onfinish = anim.oncancel = function () {
        if (!opening) d.open = false;
        body.style.overflow = "";
        delete d.dataset.busy;
      };
    });
  });
});
