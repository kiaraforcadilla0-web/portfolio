/* theme.js — light/dark toggle with a circular "reveal" from the button
   (View Transitions API where supported, plain swap elsewhere) */
KF.module("theme", function (KF) {
  var btn = KF.$("#themeToggle");
  if (!btn) return;
  var meta = document.querySelector('meta[name="theme-color"]');

  function apply(next) {
    KF.root.setAttribute("data-theme", next);
    KF.store.set("kf-theme", next);
    if (meta) meta.setAttribute("content", next === "dark" ? "#0e0a1a" : "#7c3aed");
    btn.setAttribute("aria-label", next === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
  apply(KF.root.getAttribute("data-theme") || "light");

  btn.addEventListener("click", function () {
    var next = KF.root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    KF.$$("svg", btn).forEach(function (svg) { svg.style.animation = "none"; void svg.offsetWidth; svg.style.animation = ""; });

    if (!document.startViewTransition || KF.reduceMotion) { apply(next); return; }
    var r = btn.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    KF.root.classList.add("theme-vt");
    var vt = document.startViewTransition(function () { apply(next); });
    vt.ready.then(function () {
      document.documentElement.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
        { duration: 650, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(function () {});
    vt.finished.then(function () { KF.root.classList.remove("theme-vt"); }, function () { KF.root.classList.remove("theme-vt"); });
  });
});
