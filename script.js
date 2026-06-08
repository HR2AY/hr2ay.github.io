const heroVideo = document.querySelector("#hero-video");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuLinks = Array.from(document.querySelectorAll(".mobile-nav a"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const sectionNodes = Array.from(document.querySelectorAll("[data-section]"));
const railLinks = Array.from(document.querySelectorAll(".rail-link"));
const counters = Array.from(document.querySelectorAll(".counter"));

function initializeHeroVideo() {
  if (!heroVideo) {
    return;
  }

  if (heroVideo.currentSrc || heroVideo.getAttribute("src")) {
    heroVideo.play().catch(() => {});
    return;
  }

  const streamUrl =
    "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

  if (window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls({
      enableWorker: false,
    });

    hls.loadSource(streamUrl);
    hls.attachMedia(heroVideo);
    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
      heroVideo.play().catch(() => {});
    });
    hls.on(window.Hls.Events.ERROR, () => {
      heroVideo.removeAttribute("src");
      heroVideo.load();
    });

    return;
  }

  if (heroVideo.canPlayType("application/vnd.apple.mpegurl")) {
    heroVideo.src = streamUrl;
    heroVideo.addEventListener("loadedmetadata", () => {
      heroVideo.play().catch(() => {});
    });
  }
}

function setMenuState(isOpen) {
  if (!mobileMenu || !menuToggle) {
    return;
  }

  mobileMenu.hidden = !isOpen;
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => setMenuState(true));
}

if (menuClose) {
  menuClose.addEventListener("click", () => setMenuState(false));
}

if (mobileMenu) {
  mobileMenu.addEventListener("click", (event) => {
    if (event.target === mobileMenu) {
      setMenuState(false);
    }
  });
}

mobileMenuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -10% 0px",
  },
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

    if (!visibleEntries.length) {
      return;
    }

    const activeId = visibleEntries[0].target.id;

    railLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.target === activeId);
    });
  },
  {
    threshold: [0.2, 0.35, 0.55],
    rootMargin: "-12% 0px -45% 0px",
  },
);

sectionNodes.forEach((section) => sectionObserver.observe(section));

function animateCounter(counterNode) {
  const target = Number(counterNode.dataset.counter || 0);
  const duration = 1400;
  const startTime = performance.now();

  function tick(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counterNode.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counterNode.textContent = String(target);
    }
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.65,
  },
);

counters.forEach((counterNode) => counterObserver.observe(counterNode));

initializeHeroVideo();

if (window.lucide) {
  window.lucide.createIcons();
}
