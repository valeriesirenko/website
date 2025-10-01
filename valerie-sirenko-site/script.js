// Small enhancements: active link, reveal-on-scroll, mobile menu
(function() {
  const links = document.querySelectorAll('.nav-link');
  const sections = [...links].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function setActive() {
    const pos = window.scrollY + 120;
    let active = links[links.length - 1];
    sections.forEach((sec, i) => {
      if (sec.offsetTop <= pos) active = links[i];
    });
    links.forEach(l => l.classList.remove('active'));
    if (active) active.classList.add('active');
  }
  window.addEventListener('scroll', setActive);
  setActive();

  // Reveal
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('is-visible'));
    }, { threshold: 0.18 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  // Mobile menu toggle
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    header.classList.toggle('open');
  });
  document.querySelectorAll('.nav a').forEach(a => {
    a.addEventListener('click', () => header.classList.remove('open'));
  });

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();