document.documentElement.classList.add("js");

const initIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 2,
        "aria-hidden": "true",
      },
    });
  }
};

const initLogoFallbacks = () => {
  document.querySelectorAll(".logo-pill img").forEach((image) => {
    image.addEventListener("error", () => {
      image.remove();
    });
  });
};

const initSectionTracking = () => {
  const links = Array.from(document.querySelectorAll('.navlinks a[href^="#"]'));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      links.forEach((link) => {
        link.toggleAttribute("aria-current", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    {
      rootMargin: "-25% 0px -60% 0px",
      threshold: [0.1, 0.35, 0.6],
    },
  );

  sections.forEach((section) => observer.observe(section));
};

const initReveal = () => {
  const revealItems = document.querySelectorAll(
    [
      ".metric-band article",
      ".summary-grid",
      ".education-section .section-heading",
      ".education-list article",
      ".work-section .section-heading",
      ".work-card",
      ".timeline article",
      ".additional-section .section-heading",
      ".compact-grid article",
      ".influence-section .section-heading",
      ".influence-grid article",
      ".skills-section .section-heading",
      ".skills-grid article",
      ".closing-section",
    ].join(", "),
  );

  revealItems.forEach((item) => item.setAttribute("data-reveal", ""));

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    document.documentElement.classList.add("motion-ready");
    return;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();

    if (rect.top < viewportHeight * 0.94 && rect.bottom > 0) {
      item.classList.add("is-visible");
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12,
    },
  );

  revealItems.forEach((item) => observer.observe(item));
  requestAnimationFrame(() => {
    document.documentElement.classList.add("motion-ready");
  });
};

const initMetricCountUp = () => {
  const metrics = Array.from(document.querySelectorAll("[data-count]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const formatter = new Intl.NumberFormat("en-US");

  const renderFinal = (metric) => {
    const value = Number(metric.dataset.count || "0");
    metric.textContent = `${formatter.format(value)}${metric.dataset.suffix || ""}`;
  };

  const animateMetric = (metric) => {
    if (metric.dataset.counted === "true") {
      return;
    }

    metric.dataset.counted = "true";

    const target = Number(metric.dataset.count || "0");
    const suffix = metric.dataset.suffix || "";
    const duration = 1100;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      metric.textContent = `${formatter.format(value)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  if (!metrics.length || reduceMotion) {
    metrics.forEach(renderFinal);
    return;
  }

  if (!("IntersectionObserver" in window)) {
    metrics.forEach(animateMetric);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateMetric(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.5,
    },
  );

  metrics.forEach((metric) => observer.observe(metric));
};

const initHeroDepth = () => {
  const visual = document.querySelector(".hero-visual");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!visual || reduceMotion) {
    return;
  }

  let frame = 0;

  const update = () => {
    frame = 0;
    const rect = visual.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const midpoint = rect.top + rect.height / 2;
    const progress = Math.max(-1, Math.min(1, (midpoint - viewportHeight / 2) / viewportHeight));
    visual.style.setProperty("--hero-shift", `${progress * -12}px`);
  };

  const scheduleUpdate = () => {
    if (frame) {
      return;
    }

    frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
};

initIcons();
initLogoFallbacks();
initSectionTracking();
initReveal();
initMetricCountUp();
initHeroDepth();
