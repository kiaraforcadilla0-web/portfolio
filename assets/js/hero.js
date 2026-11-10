/* hero.js — typing tagline, looping "test run" card, letter-split name */
KF.module("hero", function (KF) {
  /* ---------- typing effect ---------- */
  var typed = KF.$("#typed");
  var phrases = ["manual testing.", "test automation.", "regression testing.", "root cause analysis.", "clear bug reports.", "team collaboration."];
  if (typed && !KF.reduceMotion) {
    var p = 0, c = phrases[0].length, deleting = true;
    setTimeout(function tick() {
      var word = phrases[p];
      c += deleting ? -1 : 1;
      typed.textContent = word.slice(0, c);
      var delay = deleting ? 35 : 75;
      if (!deleting && c === word.length) { delay = 1700; deleting = true; }
      else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 300; }
      setTimeout(tick, delay);
    }, 2200);
  }

  /* ---------- "test run" card: checks pass one by one, then loops ---------- */
  var steps = KF.$$("#runList [data-step]"), summary = KF.$("#runSummary"), card = KF.$(".run-card");
  var bar = card && KF.$(".run-card__meter i", card);
  function runSuite() {
    steps.forEach(function (s) { s.classList.remove("is-running", "is-pass"); });
    summary.classList.remove("is-visible");
    if (bar) bar.style.setProperty("--p", 0);
    if (KF.reduceMotion) {
      steps.forEach(function (s) { s.classList.add("is-pass"); });
      summary.classList.add("is-visible");
      if (bar) bar.style.setProperty("--p", 1);
      return;
    }
    var i = 0;
    (function next() {
      if (i > 0) { steps[i - 1].classList.remove("is-running"); steps[i - 1].classList.add("is-pass"); }
      if (bar) bar.style.setProperty("--p", (i / steps.length).toFixed(3));
      if (i < steps.length) { steps[i].classList.add("is-running"); i++; setTimeout(next, 650); }
      else {
        summary.classList.add("is-visible");
        if (card) KF.replay(card, "is-passed");
        setTimeout(runSuite, 5000);
      }
    })();
  }
  if (steps.length && summary) setTimeout(runSuite, 1000);

  /* ---------- split the first name into letters for a hover wave ---------- */
  var name = KF.$(".hero__name");
  if (name && !KF.reduceMotion) {
    var first = name.firstChild;                       // text node "Kiara "
    if (first && first.nodeType === 3) {
      var text = first.textContent.replace(/\s+$/, "");
      var wrap = document.createElement("span");
      wrap.className = "wave";
      wrap.setAttribute("aria-hidden", "true");
      text.split("").forEach(function (ch, i) {
        var s = document.createElement("span"); s.textContent = ch; s.style.setProperty("--li", i); wrap.appendChild(s);
      });
      var sr = document.createElement("span"); sr.className = "sr-only"; sr.textContent = text;
      name.replaceChild(wrap, first);
      name.insertBefore(sr, wrap);
      name.insertBefore(document.createTextNode(" "), wrap.nextSibling);
    }
  }
});
