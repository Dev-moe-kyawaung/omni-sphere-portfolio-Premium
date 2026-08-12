(function () {
  "use strict";

  const dom = {
    topbar: document.querySelector(".topbar"),
    nav: document.querySelector(".nav"),
    hero: document.getElementById("hero"),
    work: document.getElementById("work"),
    caseStudies: document.getElementById("case-studies"),
    about: document.getElementById("about"),
    skills: document.getElementById("skills"),
    contact: document.getElementById("contact"),
    contactForm: document.querySelector(".contact-form"),
    sphere: document.querySelector(".sphere-3d"),
    themeToggle: document.getElementById("theme-toggle"),
    menuToggle: document.querySelector(".menu-toggle"),
    menuOverlay: document.querySelector(".menu-overlay"),
    menuClose: document.querySelector(".menu-close"),
    aiToggle: document.querySelector(".ai-toggle"),
    aiPanel: document.querySelector(".ai-panel"),
    aiMessages: document.querySelector(".ai-messages"),
    aiInput: document.querySelector(".ai-input"),
    aiSend: document.querySelector(".ai-send"),
    aiClose: document.querySelector(".ai-close"),
  };

  const state = {
    theme: localStorage.getItem("theme") || "dark",
    menuOpen: false,
    aiOpen: false,
    ticking: false,
  };

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setTheme = (theme) => {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (dom.themeToggle) {
      const icon = dom.themeToggle.querySelector("i");
      if (icon) icon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
    }
  };

  const toggleTheme = () => {
    setTheme(state.theme === "dark" ? "light" : "dark");
  };

  const openMenu = () => {
    state.menuOpen = true;
    dom.menuOverlay.classList.add("open");
    dom.menuToggle.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    state.menuOpen = false;
    dom.menuOverlay.classList.remove("open");
    dom.menuToggle.classList.remove("open");
    document.body.style.overflow = "";
  };

  const toggleMenu = () => {
    state.menuOpen ? closeMenu() : openMenu();
  };

  const openAI = () => {
    state.aiOpen = true;
    dom.aiPanel.classList.add("open");
    dom.aiToggle.classList.add("open");
    dom.aiInput.focus();
  };

  const closeAI = () => {
    state.aiOpen = false;
    dom.aiPanel.classList.remove("open");
    dom.aiToggle.classList.remove("open");
  };

  const toggleAI = () => {
    state.aiOpen ? closeAI() : openAI();
  };

  const scrollToTarget = (selector) => {
    const target = document.querySelector(selector);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    if (prefersReducedMotion()) {
      window.scrollTo(0, top);
      return;
    }

    const start = window.scrollY;
    const distance = top - start;
    const duration = 600;
    const startTime = performance.now();

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      window.scrollTo(0, start + distance * ease);
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        scrollToTarget(href);
        closeMenu();
      });
    });
  };

  const initActiveNav = () => {
    const sections = [dom.hero, dom.work, dom.caseStudies, dom.about, dom.skills, dom.contact].filter(Boolean);
    const links = Array.from(document.querySelectorAll(".nav a")).filter((a) => a.getAttribute("href")?.startsWith("#"));
    if (!sections.length) return;

    const onScroll = () => {
      const pos = window.scrollY + 120;
      let current = sections[0].id;

      for (const sec of sections) {
        if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
          current = sec.id;
          break;
        }
      }

      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });

      dom.topbar?.classList.toggle("elevated", window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  const initCounters = () => {
    const counters = document.querySelectorAll(".stat-value, .counter");
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const target = parseInt(entry.target.getAttribute("data-count") || "0", 10);
        const startTime = performance.now();
        const duration = 1800;

        const step = (now) => {
          const t = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          const value = Math.floor(target * ease);
          entry.target.textContent = value + "+";
          if (t < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });

    counters.forEach((el) => observer.observe(el));
  };

  const initHeroParallax = () => {
    if (!dom.sphere || prefersReducedMotion()) return;

    let rect = dom.sphere.getBoundingClientRect();
    let centerX = rect.left + rect.width / 2;
    let centerY = rect.top + rect.height / 2;

    window.addEventListener("mousemove", (e) => {
      if (state.ticking) return;
      state.ticking = true;

      requestAnimationFrame(() => {
        const x = (e.clientX - centerX) / 25;
        const y = (e.clientY - centerY) / 25;
        dom.sphere.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        state.ticking = false;
      });
    }, { passive: true });

    window.addEventListener("resize", () => {
      rect = dom.sphere.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    }, { passive: true });
  };

  const initReveal = () => {
    const items = document.querySelectorAll(".project-card, .case-study, .skill-box, .about-panel, .contact-form");
    if (!items.length || prefersReducedMotion()) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "none";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    items.forEach((el) => observer.observe(el));
  };

  const initContactForm = () => {
    if (!dom.contactForm) return;

    dom.contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = dom.contactForm.querySelector("button[type='submit']");
      if (!btn) return;

      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending...";

      await new Promise((r) => setTimeout(r, 1200));

      btn.textContent = "Message sent";
      btn.style.background = "linear-gradient(135deg, #10b981, #34d399)";
      btn.style.color = "#052010";

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = original;
        btn.style.background = "";
        btn.style.color = "";
        dom.contactForm.reset();
      }, 2200);
    });
  };

  const qa = [
    {
      keys: ["stack", "tech", "technology", "tools"],
      answer: "My core stack is Kotlin, Jetpack Compose, Clean Architecture, MVVM/MVI, Firebase, Room, Retrofit, and ExoPlayer/Media3. I also use light web tooling and AI integrations where they add value.",
    },
    {
      keys: ["project", "projects", "work", "app", "apps"],
      answer: "My featured work includes Social Dashboard, POS Ultimate Pro Max, and Advanced Video Player. Each project is shown as a short case study with problem, approach, solution, and impact.",
    },
    {
      keys: ["contact", "hire", "email", "available"],
      answer: "I’m open to senior Android roles and consulting. Email: moekyawaung@programmer.net, GitHub: github.com/Dev-moe-kyawaung, LinkedIn: linkedin.com/in/moe-kyaw-aung-2653093a1",
    },
    {
      keys: ["experience", "year", "senior", "background"],
      answer: "I have 12+ years of Android experience, 551+ repositories, and 82+ certifications. My focus is maintainable code, clean architecture, and product quality.",
    },
  ];

  const addAIMessage = (text, role) => {
    if (!dom.aiMessages) return;
    const node = document.createElement("div");
    node.className = `ai-message ${role === "user" ? "ai-user" : "ai-bot"}`;
    node.textContent = text;
    dom.aiMessages.appendChild(node);
    dom.aiMessages.scrollTop = dom.aiMessages.scrollHeight;
  };

  const answerAI = (input) => {
    const q = input.toLowerCase();
    for (const item of qa) {
      if (item.keys.some((k) => q.includes(k))) return item.answer;
    }
    return "I can answer about my stack, projects, experience, and contact details. Try: “What is your tech stack?”, “Tell me about your projects”, or “How can I contact you?”";
  };

  const initAI = () => {
    if (!dom.aiPanel) return;

    addAIMessage("Hello! Ask me about the stack, projects, experience, or contact details.", "bot");

    dom.aiToggle?.addEventListener("click", toggleAI);
    dom.aiClose?.addEventListener("click", closeAI);

    document.querySelectorAll(".ai-quick button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const q = btn.getAttribute("data-q");
        if (!q) return;
        addAIMessage(q, "user");
        setTimeout(() => addAIMessage(answerAI(q), "bot"), 300);
      });
    });

    const send = () => {
      const text = dom.aiInput.value.trim();
      if (!text) return;
      addAIMessage(text, "user");
      dom.aiInput.value = "";
      setTimeout(() => addAIMessage(answerAI(text), "bot"), 300);
    };

    dom.aiSend?.addEventListener("click", send);
    dom.aiInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") send();
      if (e.key === "Escape") closeAI();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMenu();
        closeAI();
      }
    });
  };

  const initMenu = () => {
    dom.menuToggle?.addEventListener("click", toggleMenu);
    dom.menuClose?.addEventListener("click", closeMenu);
    dom.menuOverlay?.addEventListener("click", (e) => {
      if (e.target === dom.menuOverlay) closeMenu();
    });

    dom.menuOverlay?.querySelectorAll(".nav-mobile a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  };

  const initTheme = () => {
    setTheme(state.theme);
    dom.themeToggle?.addEventListener("click", toggleTheme);
  };

  const init = () => {
    initTheme();
    initMenu();
    initAI();
    initSmoothScroll();
    initActiveNav();
    initCounters();
    initHeroParallax();
    initReveal();
    initContactForm();

    document.body.classList.add("is-ready");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
