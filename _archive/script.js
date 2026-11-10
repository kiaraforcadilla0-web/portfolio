/* =========================================================
   Kiara Forcadilla — Portfolio Scripts
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mqMobileNav = window.matchMedia("(max-width: 960px)");

  /* ---------- Safe localStorage ---------- */
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }
  };

  /* ---------- Theme toggle ---------- */
  const themeBtn = $("#themeToggle");
  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store.set("kf-theme", next);
    // replay the icon pop animation
    $$("svg", themeBtn).forEach((svg) => { svg.style.animation = "none"; void svg.offsetWidth; svg.style.animation = ""; });
  });

  /* ---------- Mobile navigation ---------- */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");

  function setMenu(open) {
    navMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  navToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("is-open")));
  $$(".nav__link").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", (e) => {
    if (navMenu.classList.contains("is-open") && !navMenu.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
  });
  mqMobileNav.addEventListener ? mqMobileNav.addEventListener("change", () => { setMenu(false); moveIndicator(); }) : null;

  /* ---------- Scroll: nav state, progress bar, back-to-top, timeline line ---------- */
  const nav = $(".nav");
  const toTop = $("#toTop");
  const progress = $("#scrollProgress");
  const timeline = $("#timeline");
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    nav.classList.toggle("is-scrolled", y > 10);
    // Hide nav when scrolling down, show when scrolling up (not while menu open)
    if (!navMenu.classList.contains("is-open")) {
      nav.classList.toggle("is-hidden", y > lastY && y > 400);
    }
    lastY = y;

    toTop.classList.toggle("is-visible", y > 600);
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.75 - r.top) / r.height;
      timeline.style.setProperty("--line", Math.max(0, Math.min(1, p)).toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Scroll spy + sliding nav indicator ---------- */
  const navLinks = $$(".nav__link");
  const indicator = $("#navIndicator");
  const linkFor = (id) => navLinks.find((a) => a.getAttribute("href") === "#" + id);
  const spyAlias = { home: null, competencies: "about", agile: "knowledge", deliverables: "knowledge", "soft-skills": "contact", objective: "contact" };

  function moveIndicator() {
    const active = $(".nav__link.is-active");
    if (!indicator) return;
    if (!active || mqMobileNav.matches) { indicator.style.opacity = "0"; return; }
    indicator.style.opacity = "1";
    indicator.style.width = active.offsetWidth + "px";
    indicator.style.transform = "translateX(" + active.offsetLeft + "px)";
  }

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id in spyAlias ? spyAlias[entry.target.id] : entry.target.id;
        navLinks.forEach((a) => a.classList.remove("is-active"));
        const link = id && linkFor(id);
        if (link) link.classList.add("is-active");
        moveIndicator();
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => spy.observe(s));
  }
  window.addEventListener("resize", moveIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);

  /* ---------- Reveal on scroll ---------- */
  // Give chips a stagger index for their pop-in animation
  $$(".chips").forEach((list) => $$("li", list).forEach((li, i) => li.style.setProperty("--ci", i)));

  const revealEls = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    // Stagger siblings for a cascade effect
    revealEls.forEach((el) => {
      const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 490) + "ms";
      revealObs.observe(el);
    });
  }

  /* ---------- Typing effect in hero ---------- */
  const typedEl = $("#typed");
  const phrases = [
    "manual testing.",
    "test automation.",
    "regression testing.",
    "root cause analysis.",
    "clear bug reports.",
    "team collaboration."
  ];
  if (typedEl && !reduceMotion) {
    let p = 0, c = phrases[0].length, deleting = true;
    setTimeout(function tick() {
      const word = phrases[p];
      c += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 75;
      if (!deleting && c === word.length) { delay = 1700; deleting = true; }
      else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 300; }
      setTimeout(tick, delay);
    }, 2200);
  }

  /* ---------- Hero "test run" animation ---------- */
  const steps = $$("#runList [data-step]");
  const summary = $("#runSummary");

  function runSuite() {
    steps.forEach((s) => s.classList.remove("is-running", "is-pass"));
    summary.classList.remove("is-visible");

    if (reduceMotion) {
      steps.forEach((s) => s.classList.add("is-pass"));
      summary.classList.add("is-visible");
      return;
    }
    let i = 0;
    (function next() {
      if (i > 0) { steps[i - 1].classList.remove("is-running"); steps[i - 1].classList.add("is-pass"); }
      if (i < steps.length) {
        steps[i].classList.add("is-running");
        i++;
        setTimeout(next, 650);
      } else {
        summary.classList.add("is-visible");
        setTimeout(runSuite, 5000);
      }
    })();
  }
  if (steps.length) setTimeout(runSuite, 1000);

  /* ---------- Skill filter ---------- */
  const filterBtns = $$(".filter-btn");
  const groups = $$(".skill-group");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      groups.forEach((g, i) => {
        const show = f === "all" || g.dataset.group === f;
        g.classList.toggle("is-hidden", !show);
        g.classList.remove("is-filtered-in");
        if (show) {
          g.classList.add("is-visible");
          void g.offsetWidth; // restart animation
          g.style.animationDelay = (i * 60) + "ms";
          g.classList.add("is-filtered-in");
        }
      });
    });
  });

  /* ---------- Card mouse-glow + 3D tilt (mouse / trackpad only) ---------- */
  if (finePointer && !reduceMotion) {
    $$(".card, .project, .job__body, .skill-group, .contact__card").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    $$(".tilt").forEach((el) => {
      const max = el.classList.contains("run-card") ? 8 : 5;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-py * max) + "deg) rotateY(" + (px * max) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Button ripple ---------- */
  $$(".btn").forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      if (reduceMotion) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = size + "px";
      span.style.left = (e.clientX - r.left - size / 2) + "px";
      span.style.top = (e.clientY - r.top - size / 2) + "px";
      btn.appendChild(span);
      span.addEventListener("animationend", () => span.remove());
    });
  });

  /* ---------- Duplicate marquee content for a seamless loop ---------- */
  const track = $(".marquee__track");
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Toast helper ---------- */
  const toast = $("#toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  /* ---------- Copy email ---------- */
  const copyBtn = $("#copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = $("#emailLink").textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
        copyBtn.textContent = "Copied!";
        showToast("Email copied to clipboard");
      } catch (e) {
        showToast(email);
      }
      setTimeout(() => (copyBtn.textContent = "Copy"), 1800);
    });
  }

  /* ---------- Placeholder links (LinkedIn / GitHub not yet set) ---------- */
  $$("[data-placeholder-link]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Profile link coming soon");
    });
  });

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
