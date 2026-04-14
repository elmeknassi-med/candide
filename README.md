# Candide School Website

A modern, responsive school website for **Candide School** built with plain HTML, CSS, and vanilla JavaScript – no frameworks or build tools required.

## Features

- **Responsive design** – works on mobile, tablet, and desktop
- **Animated navigation** – sticky navbar that changes style on scroll with a mobile hamburger menu
- **Hero section** – full-viewport welcome banner with key statistics
- **About section** – school history and core values
- **Programs** – six academic programme cards (Early Childhood → Secondary, Arts & Sports)
- **Faculty** – staff showcase cards
- **Events** – upcoming school events with date badges
- **Testimonials** – parent, student, and alumni quotes
- **Contact form** – with client-side validation and success feedback
- **Back-to-top button** – smooth scroll utility
- **Fade-in animations** – cards animate into view as you scroll (IntersectionObserver)

## Project Structure

```
candide/
├── index.html   # Main page
├── styles.css   # All styles (CSS custom properties, responsive breakpoints)
├── script.js    # Interactive behaviour (navbar, form validation, animations)
└── README.md    # This file
```

## Getting Started

Open `index.html` directly in any modern browser – no build step or server required.

```bash
# Optional: serve with a simple HTTP server
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Customisation

| What to change | Where |
|---|---|
| School name / logo | `index.html` – `.logo` elements |
| Colours & fonts | `styles.css` – `:root` CSS variables |
| Programs / Faculty / Events | `index.html` – matching `<section>` elements |
| Contact details | `index.html` – `#contact .contact-details` |
| Form submission | `script.js` – replace the simulated submit with a real API call |
