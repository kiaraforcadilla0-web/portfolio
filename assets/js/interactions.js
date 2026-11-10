/* interactions.js — skill filter, card glow + tilt, ripple, magnetic
   buttons, marquee loop, footer year */
KF.module("skills-filter", function (KF) {
  var btns = KF.$$(".filter-btn"), groups = KF.$$(".skill-group");
  btns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.filter;
      btns.forEach(function (b) { var on = b === btn; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
      groups.forEach(function (g, i) {
        var show = f === "all" || g.dataset.group === f;
        g.classList.toggle("is-hidden", !show);
        g.classList.remove("is-filtered-in");
        if (show) { g.classList.add("is-visible"); void g.offsetWidth; g.style.animationDelay = (i * 60) + "ms"; g.classList.add("is-filtered-in"); }
      });
    });
  });
});

KF.module("cards", function (KF) {
  if (!KF.finePointer || KF.reduceMotion) return;
  KF.$$(".card, .project, .job__body, .skill-group").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
  KF.$$(".tilt").forEach(function (el) {
    var max = el.classList.contains("run-card") ? 8 : 5, raf = 0, ev = null;
    el.addEventListener("pointermove", function (e) {
      ev = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = el.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5, py = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-py * max) + "deg) rotateY(" + (px * max) + "deg) translateY(-4px)";
        el.style.setProperty("--gx", (px + 0.5) * 100 + "%");
        el.style.setProperty("--gy", (py + 0.5) * 100 + "%");
      });
    });
    el.addEventListener("pointerleave", function () { el.style.transform = ""; });
  });
});

KF.module("buttons", function (KF) {
  KF.$$(".btn").forEach(function (btn) {
    btn.addEventListener("pointerdown", function (e) {
      if (KF.reduceMotion) return;
      var r = btn.getBoundingClientRect(), size = Math.max(r.width, r.height);
      var span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = size + "px";
      span.style.left = (e.clientX - r.left - size / 2) + "px";
      span.style.top = (e.clientY - r.top - size / 2) + "px";
      btn.appendChild(span);
      span.addEventListener("animationend", function () { span.remove(); });
    });
    if (btn.classList.contains("btn--primary")) btn.addEventListener("click", function (e) { KF.sparkle(e.clientX, e.clientY, 12, 55); });
  });

  /* magnetic pull on buttons and icon buttons (mouse only) */
  if (!KF.finePointer || KF.reduceMotion) return;
  KF.$$(".btn, .icon-btn, .lc__social a, .to-top").forEach(function (el) {
    el.classList.add("magnetic");
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.translate = (dx * 10).toFixed(1) + "px " + (dy * 8).toFixed(1) + "px";
    });
    el.addEventListener("pointerleave", function () { el.style.translate = ""; });
  });
});

KF.module("marquee", function (KF) {
  var marquee = KF.$(".marquee"), track = KF.$(".marquee__track");
  if (!track) return;
  track.innerHTML += track.innerHTML;                    // seamless loop
  if (KF.reduceMotion) return;
  /* the ribbon leans into fast scrolling, then settles back */
  var lastY = window.scrollY, skew = 0, target = 0, visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(marquee);
  KF.onScroll(function (s) { target = KF.clamp((s.y - lastY) * 0.35, -8, 8); lastY = s.y; });
  KF.onFrame(function () {
    if (!visible && Math.abs(skew) < 0.01) return;
    skew += (target - skew) * 0.12; target *= 0.88;
    track.style.setProperty("--skew", skew.toFixed(2) + "deg");
  });
});

KF.module("footer", function (KF) {
  var y = KF.$("#year"); if (y) y.textContent = new Date().getFullYear();
});
