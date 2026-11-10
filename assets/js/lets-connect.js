/* =========================================================
   LET'S CONNECT — reusable behavior (no dependencies)
   • reveals the banner when it scrolls into view
   • one-time confetti burst on first reveal
   • "copy email" button with a toast message
   Include after the section markup: <script src="lets-connect.js"></script>
   ========================================================= */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".lc").forEach((section) => {
    const box = section.querySelector(".lc__box");
    const title = section.querySelector(".lc__title");
    const toast = document.querySelector(".lc-toast");

    /* ---------- reveal + one-time confetti ---------- */
    const reveal = () => {
      box.classList.add("is-in");
      if (reduceMotion || !title) return;
      const r = title.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const styles = getComputedStyle(section);
      const colors = [styles.getPropertyValue("--lc-accent").trim() || "#c4f042",
                      styles.getPropertyValue("--lc-accent-2").trim() || "#2fd5f0",
                      "#7fe68f", "#ffffff", "#f59e0b"];
      for (let i = 0; i < 46; i++) {
        const c = document.createElement("span");
        c.className = "lc-confetti";
        const ang = Math.random() * Math.PI * 2, dist = 140 + Math.random() * 260;
        c.style.left = cx + "px";
        c.style.top = cy + "px";
        c.style.background = colors[i % colors.length];
        c.style.setProperty("--dx", Math.cos(ang) * dist + "px");
        c.style.setProperty("--dy", Math.sin(ang) * dist + 120 + "px");
        c.style.setProperty("--r", Math.random() * 720 - 360 + "deg");
        c.style.animationDelay = Math.random() * 0.15 + "s";
        document.body.appendChild(c);
        c.addEventListener("animationend", () => c.remove());
      }
    };
    if ("IntersectionObserver" in window && !reduceMotion) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        reveal();
      }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
      io.observe(box);
    } else {
      box.classList.add("is-in");
    }

    /* ---------- copy email ---------- */
    const copyBtn = section.querySelector(".lc-copy");
    const emailEl = section.querySelector(".lc-email");
    let timer;
    const showToast = (msg) => {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("is-visible");
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
    };
    if (copyBtn && emailEl) {
      copyBtn.addEventListener("click", async () => {
        const email = emailEl.textContent.trim();
        try { await navigator.clipboard.writeText(email); showToast("Email copied ✓"); }
        catch (e) { showToast(email); }
      });
    }
  });
})();
