/* nav.js — mobile menu, hide-on-scroll header, progress bar, back-to-top,
   scroll spy with sliding indicator */
KF.module("nav", function (KF) {
  var nav = KF.$(".nav"), navToggle = KF.$("#navToggle"), navMenu = KF.$("#navMenu");
  var toTop = KF.$("#toTop"), progress = KF.$("#scrollProgress");
  var navLinks = KF.$$(".nav__link"), indicator = KF.$("#navIndicator");

  /* ---------- mobile menu ---------- */
  function setMenu(open) {
    navMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  navToggle.addEventListener("click", function () { setMenu(!navMenu.classList.contains("is-open")); });
  navLinks.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) {
    if (navMenu.classList.contains("is-open") && !navMenu.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
  });
  if (KF.mqMobileNav.addEventListener) KF.mqMobileNav.addEventListener("change", function () { setMenu(false); moveIndicator(); });

  /* ---------- scroll state (writes only; y/max come from the core loop) ---------- */
  var lastY = window.scrollY;
  KF.onScroll(function (s) {
    var p = s.max > 0 ? Math.min(s.y / s.max, 1) : 0;
    nav.classList.toggle("is-scrolled", s.y > 10);
    if (!navMenu.classList.contains("is-open")) nav.classList.toggle("is-hidden", s.y > lastY && s.y > 400);
    lastY = s.y;
    toTop.classList.toggle("is-visible", s.y > 600);
    toTop.style.setProperty("--p", p.toFixed(4));            // progress ring around the button
    progress.style.transform = "scaleX(" + p + ")";
  });
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: KF.reduceMotion ? "auto" : "smooth" }); });

  /* ---------- scroll spy + sliding indicator ---------- */
  var spyAlias = { home: null, competencies: "about", agile: "knowledge", deliverables: "knowledge", "soft-skills": "contact", objective: "contact" };
  function moveIndicator() {
    var active = KF.$(".nav__link.is-active");
    if (!indicator) return;
    if (!active || KF.mqMobileNav.matches) { indicator.style.opacity = "0"; return; }
    indicator.style.opacity = "1";
    indicator.style.width = active.offsetWidth + "px";
    indicator.style.transform = "translateX(" + active.offsetLeft + "px)";
  }
  KF.moveIndicator = moveIndicator;

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var raw = entry.target.id, id = raw in spyAlias ? spyAlias[raw] : raw;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", !!id && a.getAttribute("href") === "#" + id); });
        moveIndicator();
        document.dispatchEvent(new CustomEvent("kf:section", { detail: raw }));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    KF.$$("main section[id]").forEach(function (s) { spy.observe(s); });
  }
  KF.onResize(moveIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
});
