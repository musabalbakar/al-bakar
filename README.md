# Albakar – Multilingual Corporate Website

A modern, animated, responsive corporate landing page for **Albakar**, a hygiene and household products company. The site supports **three languages** (Arabic RTL, Turkish, English) with a visible language switcher and no page reload.

## Structure

```
/index.html          – Single-page layout (Hero, About, Products, Why, Stats, Contact, Location, Footer)
/css/style.css       – All styles, RTL support, responsive
/js/main.js          – i18n, product tabs, GSAP, nav, form
/js/translations.js  – All copy in AR, TR, EN
/assets/images/      – (Optional) Product images, favicon
```

## Features

- **Multilingual**: Arabic (RTL), Turkish, English. Switch via header (AR | TR | EN). Text and direction update without reload; preference saved in `localStorage`.
- **Header**: Logo, nav links, language switcher, sticky on scroll, mobile menu.
- **Hero**: Brand name, slogan, CTAs, soft background, GSAP entrance.
- **Products**: Three categories with **tabs**:
  - Facial tissues (مناديل وجه)
  - Wet wipes (مناديل مبللة)
  - Dishwashing sponge / scrubber (سيف جلي)  
  Product grid is filled from `translations.js`; placeholder images per category.
- **Floating buttons**: Fixed call (tel:) and WhatsApp on the side; visible while scrolling.
- **Contact & location**: Contact form (demo submit), address block, **Google Map embed placeholder**, phone/email, and social links (Instagram, Facebook, YouTube) with hover styles.
- **Footer**: Quick links, social icons, copyright.
- **Design**: White/light background, soft blue/green accent, rounded cards, soft shadows, clean micro-interactions.
- **Animations**: GSAP + ScrollTrigger for scroll-based reveals and stat counters; no heavy effects.

## Tech

- HTML, CSS, JavaScript (no frameworks).
- GSAP + ScrollTrigger (CDN) for animations.
- RTL handled via `dir="rtl"` and `[dir="rtl"]` in CSS; Arabic uses Noto Sans Arabic when available.

## Running

1. Open `index.html` in a browser, or  
2. Serve the folder (e.g. Live Server in VS Code/Cursor or `npx serve`).

Update phone/WhatsApp URLs, social links, and the Google Map embed in `index.html` with your real data.