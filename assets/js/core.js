/* =========================================================
   core.js — tiny shared runtime for Kiara's portfolio (window.KF)
   - module(name, fn): each feature runs isolated; one failure
     never breaks the rest (status in KF.modules)
   - onScroll(write, read): one rAF loop, all reads before writes
   - onFrame(fn): one animation clock, paused when the tab is hidden
   - onResize(fn): debounced
   Classic script (works from file:// too). Load first.
   ========================================================= */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var mq = function (q) { return window.matchMedia(q); };
  var KF = window.KF = {
    $: function (s, c) { return (c || document).querySelector(s); },
    $$: function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); },
    root: root,
    reduceMotion: mq("(prefers-reduced-motion: reduce)").matches,
    finePointer: mq("(hover: hover) and (pointer: fine)").matches,
    mqMobileNav: mq("(max-width: 960px)"),
    modules: {},
    store: {
      get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
    },
    clamp: function (v, a, b) { return Math.min(b, Math.max(a, v)); }
  };

  KF.module = function (name, init) {
    try { init(KF); KF.modules[name] = "ok"; }
    catch (err) { KF.modules[name] = "error"; if (window.console) console.error("[KF:" + name + "]", err); }
  };

  /* restart a CSS animation class */
  KF.replay = function (el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- one scroll loop: reads first, then writes ---------- */
  var scrollJobs = [], scrollQueued = false;
  function runScroll() {
    scrollQueued = false;
    var state = { y: window.scrollY, vh: window.innerHeight, max: root.scrollHeight - window.innerHeight };
    var reads = scrollJobs.map(function (j) { return j.read ? j.read(state) : null; });
    scrollJobs.forEach(function (j, i) { j.write(state, reads[i]); });
  }
  KF.onScroll = function (write, read) { scrollJobs.push({ write: write, read: read }); KF.requestScroll(); };
  KF.requestScroll = function () { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(runScroll); } };
  window.addEventListener("scroll", KF.requestScroll, { passive: true });

  /* ---------- one animation clock ---------- */
  var frameJobs = [], running = false, last = 0;
  function tick(t) {
    if (!frameJobs.length || document.hidden) { running = false; return; }
    var dt = Math.min(64, t - (last || t)); last = t;
    for (var i = 0; i < frameJobs.length; i++) frameJobs[i](t, dt);
    requestAnimationFrame(tick);
  }
  function start() { if (!running && frameJobs.length && !document.hidden) { running = true; last = 0; requestAnimationFrame(tick); } }
  KF.onFrame = function (fn) { frameJobs.push(fn); start(); };
  document.addEventListener("visibilitychange", start);

  /* ---------- debounced resize ---------- */
  var resizeJobs = [], rt;
  KF.onResize = function (fn) { resizeJobs.push(fn); };
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resizeJobs.forEach(function (f) { f(); }); KF.requestScroll(); }, 120);
  });

  /* ---------- toast ---------- */
  var toastTimer;
  KF.toast = function (msg) {
    var t = KF.$("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-visible"); }, 2200);
  };

  /* ---------- purple sparkle burst at a point ---------- */
  KF.sparkle = function (x, y, n, spread) {
    if (KF.reduceMotion) return;
    var colors = ["#7c3aed", "#c026d3", "#a78bfa", "#ffffff", "#f0abfc"];
    n = n || 14; spread = spread || 70;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span");
      p.className = "ff-spark";
      var a = (Math.PI * 2 * i) / n + Math.random() * 0.4, d = spread * (0.6 + Math.random() * 0.7);
      p.style.left = (x - 4) + "px"; p.style.top = (y - 4) + "px";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", Math.cos(a) * d + "px");
      p.style.setProperty("--dy", Math.sin(a) * d + "px");
      document.body.appendChild(p);
      p.addEventListener("animationend", function () { this.remove(); });
    }
  };

  /* ---------- scramble text into place (safe to call repeatedly) ---------- */
  var GLYPHS = "!<>-_\\/[]{}=+*^?#01";
  KF.scramble = function (el, duration) {
    if (!el) return;
    var final = el.dataset.text || (el.dataset.text = el.textContent);
    if (KF.reduceMotion) { el.textContent = final; return; }
    var run = String((+el.dataset.run || 0) + 1); el.dataset.run = run;
    var t0 = performance.now(); duration = duration || 700;
    (function step(now) {
      if (el.dataset.run !== run) return;                       // a newer run took over
      var p = Math.min(1, (now - t0) / duration), out = "";
      for (var i = 0; i < final.length; i++) {
        var ch = final[i];
        out += (ch === " " || i / final.length < p) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    })(t0);
  };
})();
