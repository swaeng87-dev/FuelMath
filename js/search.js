/* =============================================================
   FUELMATH — SEARCH, NAVIGATION & BLOG ENGINE
   Loaded on every page. Every block is guarded with existence
   checks so it runs safely on homepage, tools, and blog pages.
   ============================================================= */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  /* ---------- 1. Mobile navigation toggle ---------- */
  var btn = $('mobileMenuBtn');
  var menu = $('mobileMenu');

  function setMenuIcons(isOpen) {
    var o = $('hamburgerIcon'), c = $('closeIcon');
    if (o) o.classList.toggle('hidden', isOpen);
    if (c) c.classList.toggle('hidden', !isOpen);
  }

  if (btn && menu) {
    btn.addEventListener('click', function () {
      var willOpen = menu.classList.contains('hidden');
      menu.classList.toggle('hidden', !willOpen);
      setMenuIcons(willOpen);
    });
    // Auto-close when a nav link is tapped
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.add('hidden');
        setMenuIcons(false);
      });
    });
  }

  /* ---------- 2. Homepage live tool search ---------- */
  var searchInput = $('toolSearch');

  function filterTools() {
    var q = searchInput.value.toLowerCase().trim();
    var cards = document.querySelectorAll('.tool-card');
    var sections = document.querySelectorAll('.category-section');
    var visible = 0;

    cards.forEach(function (card) {
      var hit = card.textContent.toLowerCase().indexOf(q) !== -1 || q === '';
      card.style.display = hit ? '' : 'none';
      if (hit) visible++;
    });

    sections.forEach(function (section) {
      var hasVisible = Array.prototype.some.call(
        section.querySelectorAll('.tool-card'),
        function (c) { return c.style.display !== 'none'; }
      );
      section.style.display = (!hasVisible && q !== '') ? 'none' : '';
    });

    var noRes = $('noResults');
    if (noRes) noRes.classList.toggle('hidden', visible > 0);
  }

  if (searchInput) searchInput.addEventListener('input', filterTools);

  // Exposed for the "Clear Search" button
  window.resetSearch = function () {
    if (searchInput) { searchInput.value = ''; filterTools(); }
  };

  /* ---------- 3. Blog page enhancements ---------- */
  var article = document.querySelector('[data-blog]');
  if (article) {
    // 3a. Reading progress bar
    var bar = document.createElement('div');
    bar.className = 'fm-reading-progress';
    document.body.appendChild(bar);
    window.addEventListener('scroll', function () {
      var d = document.documentElement;
      var max = d.scrollHeight - d.clientHeight;
      bar.style.width = (max > 0 ? (d.scrollTop / max) * 100 : 0) + '%';
    }, { passive: true });

    // 3b. Estimated reading time
    var words = article.textContent.trim().split(/\s+/).length;
    var mins = Math.max(1, Math.ceil(words / 220));
    var rt = article.querySelector('[data-reading-time]');
    if (rt) rt.textContent = mins + ' min read';

    // 3c. Auto-generated table of contents
    var toc = article.querySelector('[data-toc]');
    if (toc) {
      article.querySelectorAll('h2, h3').forEach(function (h, i) {
        if (!h.id) h.id = 'section-' + i;
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        if (h.tagName === 'H3') a.className = 'fm-toc-sub';
        toc.appendChild(a);
      });
    }
  }
})();
