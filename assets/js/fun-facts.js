/* =========================================================
   fun-facts.js — "Click me" bulb on the profile photo.
   A small 💡 bulb with a label travels around the arch-shaped
   photo frame. Clicking the photo shows a fun fact; on the
   first click the bulb stops where it is and says "Click for next".
   Self-contained (no dependencies).
   ========================================================= */
(function () {
  "use strict";

  const portrait = document.querySelector(".portrait");
  const frame = portrait && portrait.querySelector(".portrait__frame");
  if (!portrait || !frame) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const verb = finePointer ? "Click" : "Tap";

  // Facts are taken from Kiara's own portfolio content.
  const FACTS = [
    "Hi! I'm Kiara 👋 a detail-oriented QA Engineer.",
    "QA Engineer at AutomationHQ since September 2025 🚀",
    "I build automated tests on AHQ's No-Code Automation Platform 🤖",
    "Magna Cum Laude & Dean's Lister at Bulacan State University 🎓",
    "I built and tested an Event Attendance System for my thesis 🛠️",
    "I lead QA learning sessions on SDLC, STLC & testing 📚",
    "Before QA: Virtual Assistant & Student Assistant 🗂️"
  ];

  // bulb + label
  const hint = document.createElement("span");
  hint.className = "ff-hint";
  hint.setAttribute("aria-hidden", "true");
  hint.innerHTML = `<span class="ff-hint__icon">💡</span><span class="ff-hint__label">${verb} me</span>`;
  portrait.appendChild(hint);
  const icon = hint.querySelector(".ff-hint__icon");
  const label = hint.querySelector(".ff-hint__label");

  // the photo frame acts as the button
  frame.setAttribute("role", "button");
  frame.setAttribute("tabindex", "0");
  frame.setAttribute("aria-label", `Show a fun fact about Kiara (${FACTS.length} facts)`);

  const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  let index = 0, bubble = null, timer;
  function showFact() {
    if (index === 0) {
      portrait.classList.add("ff-parked");          // bulb stops right where it is
      label.textContent = `${verb} for next`;
    }
    replay(icon, "is-bump");
    replay(frame, "ff-pop");
    if (bubble) bubble.remove();
    bubble = document.createElement("div");
    bubble.className = "ff-bubble";
    bubble.setAttribute("role", "status");
    bubble.textContent = FACTS[index % FACTS.length];
    index++;
    portrait.appendChild(bubble);
    if (!reduceMotion) sparkle();
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!bubble) return;
      bubble.classList.add("is-out");
      const b = bubble; bubble = null;
      setTimeout(() => b.remove(), 400);
    }, 4600);
  }

  // small purple sparkle burst from the photo centre
  function sparkle() {
    const r = frame.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const colors = ["#7c3aed", "#c026d3", "#a78bfa", "#ffffff", "#f0abfc"];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("span");
      p.className = "ff-spark";
      const a = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
      const d = 90 + Math.random() * 90;
      p.style.left = cx - 4 + "px";
      p.style.top = cy - 4 + "px";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", Math.cos(a) * d + "px");
      p.style.setProperty("--dy", Math.sin(a) * d + "px");
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
  }

  frame.addEventListener("click", showFact);
  frame.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showFact(); }
  });
})();
