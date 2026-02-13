/**
 * Albakar – Multilingual landing page
 * Handles i18n (AR, TR, EN), RTL, product tabs, GSAP, nav, form.
 * Enhanced version with improved animations and performance
 */

(function () {
  const STORAGE_KEY = "albakar-lang";
  const DEFAULT_LANG = "ar";

  function getStoredLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === "ar" || stored === "tr" || stored === "en")) return stored;
    } catch (_) {}
    return DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
  }

  function getNested(obj, path) {
    const keys = path.split(".");
    let cur = obj;
    for (const k of keys) {
      if (cur == null) return undefined;
      cur = cur[k];
    }
    return cur;
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s == null ? "" : String(s);
    return div.innerHTML;
  }

  function getLangOrFallback(source, lang) {
    if (!source) return [];
    return source[lang] || source.en || [];
  }

  /* ---------------- i18n ---------------- */

  function applyTranslations(lang) {
    if (typeof ALBAKAR_TRANSLATIONS === "undefined") return;

    const t = ALBAKAR_TRANSLATIONS[lang];
    if (!t) return;

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    if (t.meta && t.meta.title) document.title = t.meta.title;

    if (t.meta && t.meta.description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", t.meta.description);
    }

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const val = getNested(t, key);
      if (typeof val === "string") el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = getNested(t, key);
      if (typeof val === "string") el.placeholder = val;
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
  }

  /* ---------------- Products ---------------- */

  function renderProductGrid(lang, category) {
    const grid = document.getElementById("product-grid");
    if (!grid || typeof ALBAKAR_TRANSLATIONS === "undefined") return;

    const t = ALBAKAR_TRANSLATIONS[lang];

    const localizedItems =
      t &&
      t.products &&
      t.products.items &&
      t.products.items[category];

    const baseItems =
      ALBAKAR_TRANSLATIONS.en &&
      ALBAKAR_TRANSLATIONS.en.products &&
      ALBAKAR_TRANSLATIONS.en.products.items &&
      ALBAKAR_TRANSLATIONS.en.products.items[category];

    if (!Array.isArray(localizedItems)) {
      grid.innerHTML = "";
      return;
    }

    const placeholders = {
      facial: "https://via.placeholder.com/480x320.png?text=Facial+Tissues",
      wet: "https://via.placeholder.com/480x320.png?text=Wet+Wipes",
      sponge: "https://via.placeholder.com/480x320.png?text=Dish+Sponge",
    };

    const fallbackImg = placeholders[category] || placeholders.facial;

    grid.innerHTML = localizedItems
      .map(function (p, i) {
        const baseItem = baseItems && baseItems[i];

        const image =
          (p && p.image) ||
          (baseItem && baseItem.image) ||
          fallbackImg;

        const tags = Array.isArray(p.tags) ? p.tags : [];

        const tagsHtml = tags
          .map(function (tag) {
            return "<li>" + escapeHtml(tag) + "</li>";
          })
          .join("");

        return (
          '<article class="product-card reveal-up" style="opacity:0;transform:translateY(30px);">' +
            '<div class="product-media">' +
              '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy" />' +
            "</div>" +
            '<div class="product-body">' +
              "<h3>" + escapeHtml(p.name) + "</h3>" +
              "<p>" + escapeHtml(p.desc) + "</p>" +
              '<ul class="product-tags">' + tagsHtml + "</ul>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");

    // Enhanced GSAP animation with stagger
    if (window.gsap && window.ScrollTrigger) {
      const cards = gsap.utils.toArray("#product-grid .reveal-up");
      
      cards.forEach(function (el, index) {
        gsap.to(el, {
          scrollTrigger: { 
            trigger: el, 
            start: "top 85%",
            toggleActions: "play none none none"
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: index * 0.08,
          ease: "power2.out",
        });
      });
    } else {
      // Fallback animation without GSAP
      const cards = grid.querySelectorAll(".reveal-up");
      cards.forEach(function (el, index) {
        setTimeout(function() {
          el.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
          el.style.opacity = "1";
          el.style.transform = "none";
        }, index * 80);
      });
    }
  }

  /* ---------------- Skills ---------------- */

  function renderSkills(lang) {
    const grid = document.getElementById("skills-grid");
    if (!grid || typeof window.ALB_SKILLS === "undefined") return;

    const items = getLangOrFallback(window.ALB_SKILLS, lang);

    grid.innerHTML = items
      .map(function (item) {
        return (
          '<div class="skill-item reveal-up" style="opacity:0;transform:translateY(20px);">' +
            '<div class="skill-header">' +
              '<span class="skill-label">' + escapeHtml(item.label) + "</span>" +
              '<span class="skill-value">' + Number(item.percent) + "%</span>" +
            "</div>" +
            '<div class="skill-bar">' +
              '<div class="skill-bar-fill" data-target="' + Number(item.percent) + '" style="width:0%;"></div>' +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    if (window.gsap && window.ScrollTrigger) {
      // Animate skill items
      gsap.utils.toArray("#skills-grid .skill-item").forEach(function (item, index) {
        gsap.to(item, {
          scrollTrigger: { 
            trigger: item, 
            start: "top 85%",
            toggleActions: "play none none none"
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.1,
          ease: "power2.out",
        });
      });

      // Animate skill bars
      gsap.utils.toArray("#skills-grid .skill-bar-fill").forEach(function (bar) {
        const target = Number(bar.getAttribute("data-target") || "0");
        if (!target) return;

        gsap.to(bar, {
          width: target + "%",
          duration: 1.4,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bar,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });
    } else {
      // Fallback without GSAP
      const items = grid.querySelectorAll(".skill-item");
      items.forEach(function(item, index) {
        setTimeout(function() {
          item.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
          item.style.opacity = "1";
          item.style.transform = "none";
          
          const bar = item.querySelector(".skill-bar-fill");
          if (bar) {
            const target = bar.getAttribute("data-target");
            setTimeout(function() {
              bar.style.transition = "width 1.2s ease-out";
              bar.style.width = target + "%";
            }, 200);
          }
        }, index * 100);
      });
    }
  }

  /* ---------------- Clients ---------------- */

  function renderClients(lang) {
    const grid = document.getElementById("clients-grid");
    if (!grid || typeof window.ALB_CLIENTS === "undefined") return;

    const items = getLangOrFallback(window.ALB_CLIENTS, lang);

    grid.innerHTML = items
      .map(function (c) {
        return (
          '<article class="client-card reveal-up" style="opacity:0;transform:translateY(25px);">' +
            '<div class="client-logo-wrap">' +
              '<img src="' + escapeHtml(c.logo) + '" alt="' + escapeHtml(c.name) + '" class="client-logo" loading="lazy" />' +
            "</div>" +
            '<div class="client-body">' +
              '<p class="client-role">' + escapeHtml(c.role || "") + "</p>" +
              '<h3 class="client-name">' + escapeHtml(c.name) + "</h3>" +
              '<p class="client-description">' + escapeHtml(c.description || "") + "</p>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");

    // Animate client cards
    if (window.gsap && window.ScrollTrigger) {
      gsap.utils.toArray("#clients-grid .reveal-up").forEach(function (el, index) {
        gsap.to(el, {
          scrollTrigger: { 
            trigger: el, 
            start: "top 85%",
            toggleActions: "play none none none"
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.08,
          ease: "power2.out",
        });
      });
    } else {
      const cards = grid.querySelectorAll(".reveal-up");
      cards.forEach(function(el, index) {
        setTimeout(function() {
          el.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
          el.style.opacity = "1";
          el.style.transform = "none";
        }, index * 80);
      });
    }
  }

  /* ---------------- Stories ---------------- */

  function renderStories(lang) {
    const grid = document.getElementById("stories-grid");
    if (!grid || typeof window.ALB_STORIES === "undefined") return;

    const items = getLangOrFallback(window.ALB_STORIES, lang);

    grid.innerHTML = items
      .map(function (s) {
        const hasImage = !!s.image;

        return (
          '<article class="story-card reveal-up" style="opacity:0;transform:translateY(25px);">' +
            (hasImage
              ? '<div class="story-media"><img src="' + escapeHtml(s.image) + '" alt="' + escapeHtml(s.title) + '" loading="lazy" /></div>'
              : "") +
            '<div class="story-body">' +
              '<h3 class="story-title">' + escapeHtml(s.title) + "</h3>" +
              '<p class="story-summary">' + escapeHtml(s.summary || "") + "</p>" +
              '<button type="button" class="btn btn-ghost story-btn" data-story-id="' + escapeHtml(s.id) + '">' +
                '<span data-i18n="stories.viewDetails">View details</span>' +
              "</button>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");

    // Animate story cards
    if (window.gsap && window.ScrollTrigger) {
      gsap.utils.toArray("#stories-grid .reveal-up").forEach(function (el, index) {
        gsap.to(el, {
          scrollTrigger: { 
            trigger: el, 
            start: "top 85%",
            toggleActions: "play none none none"
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.08,
          ease: "power2.out",
        });
      });
    } else {
      const cards = grid.querySelectorAll(".reveal-up");
      cards.forEach(function(el, index) {
        setTimeout(function() {
          el.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
          el.style.opacity = "1";
          el.style.transform = "none";
        }, index * 80);
      });
    }

    grid.querySelectorAll(".story-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-story-id");
        const dataset = getLangOrFallback(window.ALB_STORIES, getStoredLang());
        const story = dataset.find(function (item) {
          return item.id === id;
        });

        if (story) {
          alert(story.title + "\n\n" + (story.summary || ""));
        }
      });
    });
  }

  /* ---------------- Availability map ---------------- */

  function renderAvailability(lang) {
    const markersContainer = document.getElementById("availability-markers");
    const listEl = document.getElementById("availability-list");
    const selectedEl = document.getElementById("availability-selected");

    if (
      !markersContainer ||
      !listEl ||
      !selectedEl ||
      typeof window.ALB_AVAILABILITY === "undefined"
    ) return;

    const items = getLangOrFallback(window.ALB_AVAILABILITY, lang);

    if (!items.length) {
      markersContainer.innerHTML = "";
      listEl.innerHTML = "";
      selectedEl.innerHTML = "";
      return;
    }

    markersContainer.innerHTML = items
      .map(function (c) {
        return (
          '<button type="button" class="availability-marker" data-code="' +
          escapeHtml(c.code) +
          '" style="left:' + c.x + '%;top:' + c.y + '%;" aria-label="' + escapeHtml(c.name) + '">' +
            '<span class="availability-dot"></span>' +
          "</button>"
        );
      })
      .join("");

    listEl.innerHTML = items
      .map(function (c) {
        return (
          '<li class="availability-list-item" data-code="' + escapeHtml(c.code) + '">' +
            '<span class="availability-country">' + escapeHtml(c.name) + "</span>" +
            '<span class="availability-products">' + escapeHtml(c.productsLabel || "") + "</span>" +
          "</li>"
        );
      })
      .join("");

    function setSelected(code) {
      const country =
        items.find(function (c) { return c.code === code; }) || items[0];

      if (!country) return;

      selectedEl.innerHTML =
        '<h3 class="availability-selected-title">' + escapeHtml(country.name) + "</h3>" +
        '<p class="availability-selected-text">' + escapeHtml(country.productsLabel || "") + "</p>";

      markersContainer.querySelectorAll(".availability-marker").forEach(function (el) {
        el.classList.toggle("active", el.getAttribute("data-code") === country.code);
      });

      listEl.querySelectorAll(".availability-list-item").forEach(function (el) {
        el.classList.toggle("active", el.getAttribute("data-code") === country.code);
      });
    }

    if (items[0]) setSelected(items[0].code);

    markersContainer.querySelectorAll(".availability-marker").forEach(function (marker) {
      marker.addEventListener("mouseenter", function () {
        setSelected(marker.getAttribute("data-code"));
      });
      marker.addEventListener("click", function () {
        setSelected(marker.getAttribute("data-code"));
      });
    });

    listEl.querySelectorAll(".availability-list-item").forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        setSelected(item.getAttribute("data-code"));
      });
      item.addEventListener("click", function () {
        setSelected(item.getAttribute("data-code"));
      });
    });
  }

  /* ---------------- UI / init ---------------- */

  function initLangSwitcher() {
    let currentLang = getStoredLang();

    applyTranslations(currentLang);
    renderProductGrid(currentLang, "facial");
    renderSkills(currentLang);
    renderClients(currentLang);
    renderStories(currentLang);
    renderAvailability(currentLang);

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const lang = btn.getAttribute("data-lang");
        if (!lang) return;

        currentLang = lang;
        setStoredLang(lang);

        applyTranslations(lang);

        const activeTab = document.querySelector(".product-tab.active");
        const category = activeTab
          ? activeTab.getAttribute("data-category")
          : "facial";

        renderProductGrid(lang, category);
        renderSkills(lang);
        renderClients(lang);
        renderStories(lang);
        renderAvailability(lang);
      });
    });
  }

  function initProductTabs() {
    const tabs = document.querySelectorAll(".product-tab");
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const category = tab.getAttribute("data-category");
        if (!category) return;

        tabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");

        renderProductGrid(getStoredLang(), category);
      });
    });
  }

  function initNav() {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (!navToggle || !navLinks) return;

    navToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
    });

    // Close on click outside
    document.addEventListener("click", function(e) {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
      }
    });

    // Close on link click
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();

        const headerOffset = 76;
        const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset + 4;

        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      });
    });
  }

  function initYear() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  }
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form || typeof emailjs === "undefined") return;

  emailjs.init("hhjmASGDBIW9kF7ig"); // ⚠️ غير المفتاح القديم

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // 🛡️ 1) Honeypot check (كشف البوت)
    if (form.botcheck.value !== "") {
      alert("Bot detected ❌");
      return;
    }

    

    // 🛡️  Rate limit (مرة كل 30 ثانية)
    const lastTime = localStorage.getItem("lastSendTime");
    const now = Date.now();
    if (lastTime && now - lastTime < 30000) {
      alert("انتظر قليلاً قبل الإرسال مرة أخرى ⏳");
      return;
    }
    localStorage.setItem("lastSendTime", now);

    const btn = form.querySelector(".btn-submit");
    if (btn) btn.disabled = true;

    Promise.all([
      // Send to Admin
      emailjs.sendForm("service_6a5mlge", "template_d72w4o5", form),

      // Auto reply to Client
      emailjs.sendForm("service_6a5mlge", "template_e3x4jfb", form),
    ])
      .then(function () {
        const lang = getStoredLang();
        const t = ALBAKAR_TRANSLATIONS[lang];

        alert(t.contact.success);
        form.reset();
        grecaptcha.reset(); // إعادة تعيين الكابتشا
      })
      .catch(function (error) {
        const lang = getStoredLang();
        const t = ALBAKAR_TRANSLATIONS[lang];

        alert(t.contact.error);
        console.error(error);
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  });
}
  

  function initHeaderScroll() {
    const header = document.querySelector(".header");
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener("scroll", function() {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.style.boxShadow = "0 4px 20px rgba(15, 23, 42, 0.1)";
      } else {
        header.style.boxShadow = "";
      }

      lastScroll = currentScroll;
    });
  }

  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) {
      // Fallback animation without GSAP
      document.querySelectorAll(".reveal-up, .reveal-fade").forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Hero animations
    gsap.to(".hero .reveal-up", {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.08,
      delay: 0.1,
    });

    gsap.to(".hero .reveal-fade", {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.1,
      delay: 0.2,
    });

    // Section reveal animations
    gsap.utils.toArray(".section .reveal-up").forEach(function (el) {
      if (el.closest(".hero")) return;

      gsap.to(el, {
        scrollTrigger: { 
          trigger: el, 
          start: "top 80%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
      });
    });

    gsap.utils.toArray(".section .reveal-fade").forEach(function (el) {
      if (el.closest(".hero")) return;

      gsap.to(el, {
        scrollTrigger: { 
          trigger: el, 
          start: "top 80%",
          toggleActions: "play none none none"
        },
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
      });
    });

    // Stats counter animation
    const statNumbers = gsap.utils.toArray(".stat-number");

    statNumbers.forEach(function (el) {
      const targetValue = parseInt(el.getAttribute("data-target") || "0", 10);
      if (!targetValue) return;

      const isLarge = targetValue >= 1000;

      gsap.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: targetValue,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play none none none",
          },
          snap: { innerText: 1 },
          onUpdate: function () {
            const current = Number(String(el.innerText).replace(/,/g, ""));
            el.innerText = isLarge
              ? current.toLocaleString()
              : String(current);
          },
        }
      );
    });

    // About cards stagger
    gsap.utils.toArray(".about-card").forEach(function (el, index) {
      gsap.to(el, {
        scrollTrigger: { 
          trigger: el, 
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: index * 0.1,
        ease: "power2.out",
      });
    });

    // Material cards stagger
    gsap.utils.toArray(".material-card").forEach(function (el, index) {
      gsap.to(el, {
        scrollTrigger: { 
          trigger: el, 
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: index * 0.08,
        ease: "power2.out",
      });
    });

    // Stat cards stagger
    gsap.utils.toArray(".stat-card").forEach(function (el, index) {
      gsap.to(el, {
        scrollTrigger: { 
          trigger: el, 
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 0.5,
        delay: index * 0.08,
        ease: "power2.out",
      });
    });
  }

  function init() {
    initLangSwitcher();
    initProductTabs();
    initNav();
    initSmoothScroll();
    initYear();
    initContactForm();
    initHeaderScroll();
    initGSAP();

    // Add loaded class to body
    setTimeout(function() {
      document.body.classList.add("loaded");
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();