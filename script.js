// Reactive / haptic feedback for header interactions (nav links, logo, CTA, toggle)
(function () {
  const tappable = document.querySelectorAll('.nav-links a, .nav-actions .btn, .nav-toggle, .logo, .hero-actions .btn');
  const buzz = () => { if (navigator.vibrate) navigator.vibrate(12); };
  tappable.forEach(el => {
    el.addEventListener('touchstart', () => { el.classList.add('pressed'); buzz(); }, { passive: true });
    el.addEventListener('touchend', () => el.classList.remove('pressed'));
    el.addEventListener('touchcancel', () => el.classList.remove('pressed'));
    el.addEventListener('mousedown', () => el.classList.add('pressed'));
    el.addEventListener('mouseup', () => el.classList.remove('pressed'));
    el.addEventListener('mouseleave', () => el.classList.remove('pressed'));
  });
})();

// Products drawer — slide open to reveal remaining product categories
(function () {
  const btn = document.getElementById('viewAllProductsBtn');
  const label = document.getElementById('viewAllProductsLabel');
  const drawer = document.getElementById('productsDrawer');
  if (!btn || !drawer) return;
  let open = false;
  btn.addEventListener('click', () => {
    open = !open;
    drawer.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    label.innerHTML = open
      ? 'Show fewer products <span class="arrow">&rarr;</span>'
      : 'View all products <span class="arrow">&rarr;</span>';
    if (open) {
      setTimeout(() => drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
    }
  });
})();
// Resources drawer — slide open to reveal remaining resource cards
(function () {
  const btn = document.getElementById('viewAllResourcesBtn');
  const label = document.getElementById('viewAllResourcesLabel');
  const drawer = document.getElementById('resourcesDrawer');
  if (!btn || !drawer) return;
  let open = false;
  btn.addEventListener('click', () => {
    open = !open;
    drawer.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    label.innerHTML = open
      ? 'Show fewer resources <span class="arrow">&rarr;</span>'
      : 'View all resources <span class="arrow">&rarr;</span>';
    if (open) {
      setTimeout(() => drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
    }
  });
})();
// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

// Products/Resources/Updates dropdowns: hover handles desktop via CSS; this adds tap/keyboard support
const navDropdowns = document.querySelectorAll('.nav-item-dropdown');
navDropdowns.forEach(navDropdown => {
  const dropdownToggle = navDropdown.querySelector('.nav-dropdown-toggle');
  dropdownToggle.addEventListener('click', (e) => {
    if (window.matchMedia('(max-width:860px)').matches) {
      e.preventDefault();
      // close any other open dropdown first
      navDropdowns.forEach(other => {
        if (other !== navDropdown) {
          other.classList.remove('open');
          other.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
        }
      });
      const isOpen = navDropdown.classList.toggle('open');
      dropdownToggle.setAttribute('aria-expanded', isOpen);
    }
  });
});
document.addEventListener('click', (e) => {
  navDropdowns.forEach(navDropdown => {
    if (!navDropdown.contains(e.target)) {
      navDropdown.classList.remove('open');
      navDropdown.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
    }
  });
});

// Scroll reveal — cards/grids
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

// Scroll reveal — whole section bands. Triggered later than the card
// observer above (only once a section has scrolled well into view,
// not just barely peeking onto the screen) so the motion actually
// plays out in front of the user instead of finishing off-screen
// before they scroll far enough to see it.
const sectionRevealIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); sectionRevealIO.unobserve(e.target); }
  });
}, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
document.querySelectorAll('section.block').forEach(el => sectionRevealIO.observe(el));

// Page transition veil — a felt handoff between pages instead of an
// instant cut. On load the veil fades away; on an internal-page link
// click it fades back in first, then the browser navigates.
(function () {
  const veil = document.querySelector('.page-veil');
  if (!veil) return;
  const DURATION = 600; // keep in sync with the .page-veil transition in style.css
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    veil.classList.add('is-hidden');
    return;
  }

  // Reveal the incoming page.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => veil.classList.add('is-hidden'));
  });

  const isSamePageNav = (url) => {
    try {
      const dest = new URL(url, window.location.href);
      return dest.origin === window.location.origin
        && dest.pathname === window.location.pathname
        && dest.hash !== '';
    } catch (e) { return false; }
  };

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    let dest;
    try { dest = new URL(href, window.location.href); } catch (e) { return; }
    if (dest.origin !== window.location.origin) return;      // external site: no veil
    if (isSamePageNav(href)) return;                          // same-page anchor: let smooth-scroll handle it

    link.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      veil.classList.add('is-leaving');
      veil.classList.remove('is-hidden');
      setTimeout(() => { window.location.href = dest.href; }, DURATION);
    });
  });
})();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Animated stat counters (About section)
const statEls = document.querySelectorAll('.stat .n[data-count], .trust-stat .n[data-count]');
if (statEls.length) {
  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    const duration = 5000, start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animate(e.target); statIO.unobserve(e.target); } });
  }, { threshold: 0.4 });
  statEls.forEach(el => statIO.observe(el));
}

// Founder quote carousel (tabs + prev/next)
(function () {
  const wrap = document.getElementById('founderQuotes');
  if (!wrap) return;
  const slides = [...wrap.querySelectorAll('.quote-slide')];
  const tabs = [...wrap.querySelectorAll('.quote-tab')];
  let current = 0;
  function show(i) {
    current = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === current));
    tabs.forEach((t, idx) => t.classList.toggle('is-active', idx === current));
  }
  window.founderQuoteNav = (dir) => show(current + dir);
  window.founderQuoteGoTo = (i) => show(i);
})();

// About slideshow (dots + autoplay)
(function () {
  const wrap = document.getElementById('aboutSlideshow');
  if (!wrap) return;
  const slides = [...wrap.querySelectorAll('.slideshow-track .slide')];
  const dotsWrap = document.getElementById('slideDots');
  let current = 0, timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => { show(i); restart(); });
    dotsWrap.appendChild(dot);
  });
  const dots = [...dotsWrap.children];

  function show(i) {
    slides[current].classList.remove('is-active');
    dots[current]?.classList.remove('is-active');
    current = ((i % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current]?.classList.add('is-active');
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 4500);
  }

  window.aboutSlideshowNav = (dir) => { show(current + dir); restart(); };
  restart();
  wrap.addEventListener('mouseenter', () => clearInterval(timer));
  wrap.addEventListener('mouseleave', restart);
})();

// Header elevation + fade on scroll direction, reveal on hover near top
const headerEl = document.querySelector('header');
const headerHoverZone = document.getElementById('headerHoverZone');
let lastScrollY = window.scrollY;

const onScroll = () => {
  const y = window.scrollY;
  headerEl.classList.toggle('scrolled', y > 8);
  if (y <= 80) {
    headerEl.classList.remove('header-hidden');
  } else if (y > lastScrollY) {
    headerEl.classList.add('header-hidden');
  } else {
    headerEl.classList.remove('header-hidden');
  }
  lastScrollY = y;
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
headerHoverZone.addEventListener('mouseenter', () => headerEl.classList.remove('header-hidden'));

// Hero video zoom on scroll
const heroVideo = document.querySelector('.hero-bg video');
const heroSection = document.querySelector('.hero');
if (heroVideo && heroSection && !prefersReducedMotion) {
  const heroZoomOnScroll = () => {
    const rect = heroSection.getBoundingClientRect();
    const progress = Math.min(Math.max(1 - (rect.bottom / (rect.height + window.innerHeight)), 0), 1);
    heroVideo.style.transform = `scale(${1 + progress * 0.22})`;
  };
  heroZoomOnScroll();
  window.addEventListener('scroll', heroZoomOnScroll, { passive: true });
}

// Active nav-link tracking by section in view
const navAnchors = [...navLinks.querySelectorAll('a')];
const setActive = (id) => navAnchors.forEach(a =>
  a.classList.toggle('active', a.getAttribute('href') === '#' + id)
);
const sectionIO = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
['products', 'resources', 'track-record', 'about', 'contact']
  .map(id => document.getElementById(id))
  .filter(Boolean)
  .forEach(sec => sectionIO.observe(sec));
/* ==========================================================
   LIGHTBOX — click-to-enlarge viewer for project media
   Works on any element with class "js-lightbox" and either:
     data-lightbox-type="image"  data-lightbox-src="path.jpg"
     data-lightbox-type="pdf"    data-lightbox-src="path.pdf"
   Optional: data-lightbox-caption="Text shown under the media"
   ========================================================== */
(function () {
  document.addEventListener("DOMContentLoaded", function () {

    // Build the overlay once and reuse it
    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="lightbox-inner">' +
        '<button type="button" class="lightbox-close" aria-label="Close">' +
          '<i class="fa-solid fa-xmark"></i>' +
        '</button>' +
        '<a class="lightbox-open-tab" target="_blank" rel="noopener" style="display:none;">' +
          '<i class="fa-solid fa-up-right-from-square"></i> Open in new tab' +
        '</a>' +
        '<div class="lightbox-media"></div>' +
        '<p class="lightbox-caption"></p>' +
      '</div>';
    document.body.appendChild(overlay);

    var mediaHost   = overlay.querySelector(".lightbox-media");
    var captionEl   = overlay.querySelector(".lightbox-caption");
    var closeBtn    = overlay.querySelector(".lightbox-close");
    var openTabLink = overlay.querySelector(".lightbox-open-tab");
    var lastFocused = null;

    function openLightbox(src, type, caption) {
      mediaHost.innerHTML = "";

      if (type === "pdf") {
        var iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.title = caption || "PDF document";
        mediaHost.appendChild(iframe);
        openTabLink.href = src;
        openTabLink.style.display = "inline-flex";
      } else {
        var img = document.createElement("img");
        img.src = src;
        img.alt = caption || "";
        mediaHost.appendChild(img);
        openTabLink.href = src;
        openTabLink.style.display = "inline-flex";
      }

      captionEl.textContent = caption || "";
      captionEl.style.display = caption ? "block" : "none";

      lastFocused = document.activeElement;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      // Clear content shortly after so PDFs/videos stop loading in the background
      setTimeout(function () { mediaHost.innerHTML = ""; }, 200);
      if (lastFocused) lastFocused.focus();
    }

    closeBtn.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) {
        closeLightbox();
      }
    });

    // Wire up every trigger on the page
    var triggers = document.querySelectorAll(".js-lightbox");
    triggers.forEach(function (el) {
      el.setAttribute("tabindex", el.getAttribute("tabindex") || "0");
      el.setAttribute("role", el.getAttribute("role") || "button");

      function trigger(e) {
        // If the click landed on a real link inside (e.g. the PDF badge),
        // don't also navigate — just open the lightbox.
        if (e) e.preventDefault();
        var src     = el.getAttribute("data-lightbox-src");
        var type    = el.getAttribute("data-lightbox-type") || "image";
        var caption = el.getAttribute("data-lightbox-caption") || "";
        if (src) openLightbox(src, type, caption);
      }

      el.addEventListener("click", trigger);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") trigger(e);
      });
    });
  });
})();