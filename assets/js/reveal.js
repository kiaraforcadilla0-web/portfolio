/* reveal.js — scroll reveals with sibling stagger, timeline line drawing,
   timeline markers that light up as the line reaches them */
KF.module("reveal", function (KF) {
  KF.$$(".chips").forEach(function (list) { KF.$$("li", list).forEach(function (li, i) { li.style.setProperty("--ci", i); }); });

  var els = KF.$$(".reveal");
  if (KF.reduceMotion || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.dispatchEvent(new CustomEvent("kf:reveal", { bubbles: true }));
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) {
      var sib = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
      var idx = sib.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 490) + "ms";
      obs.observe(el);
    });
  }

  /* ---------- timeline: line grows with scroll, markers light up ---------- */
  var timeline = KF.$("#timeline");
  if (!timeline) return;
  var jobs = KF.$$(".job", timeline);
  KF.onScroll(function (s, m) {
    var p = KF.clamp((s.vh * 0.75 - m.top) / m.height, 0, 1);
    timeline.style.setProperty("--line", p.toFixed(3));
    jobs.forEach(function (job, i) { job.classList.toggle("is-reached", m.marks[i] <= s.vh * 0.75); });
  }, function () {
    var r = timeline.getBoundingClientRect();
    return { top: r.top, height: r.height, marks: jobs.map(function (j) { return j.getBoundingClientRect().top + 26; }) };
  });
});
