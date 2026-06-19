/* ═══════════════════════════════════════════
   DÉBARRAS DMS — Interactions & animations
   ═══════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Reveal au scroll (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll(".reveal");
  const revObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => revObserver.observe(el));

  /* ── Nav : état au scroll ── */
  const nav = document.getElementById("nav");
  const fab = document.getElementById("fab");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 30);
    fab.classList.toggle("show", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Menu mobile ── */
  const burger = document.getElementById("burger");
  const navMobile = document.getElementById("navMobile");
  const toggleMenu = (force) => {
    const open = typeof force === "boolean" ? force : !burger.classList.contains("open");
    burger.classList.toggle("open", open);
    navMobile.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  };
  burger.addEventListener("click", () => toggleMenu());
  navMobile.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggleMenu(false))
  );

  /* ── Compteurs animés ── */
  const counters = document.querySelectorAll(".stat__num");
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const dur = 1400;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => countObserver.observe(c));

  /* ── Parallaxe légère du hero ── */
  const orbs = document.querySelectorAll(".hero__orb");
  const heroContent = document.querySelector(".hero__content");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y > window.innerHeight) return;
        orbs.forEach((o, i) => {
          o.style.transform = `translateY(${y * (i === 0 ? 0.18 : 0.12)}px)`;
        });
        if (heroContent) {
          heroContent.style.transform = `translateY(${y * 0.16}px)`;
          heroContent.style.opacity = String(Math.max(1 - y / 650, 0));
        }
      },
      { passive: true }
    );
  }

  /* ── Année dynamique footer ── */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Formulaire : feedback ── */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      const btn = form.querySelector("button[type=submit]");
      if (btn) {
        btn.textContent = "Ouverture de votre messagerie…";
      }
      // Laisse le mailto se déclencher naturellement.
    });
  }
})();
