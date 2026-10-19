# LIC AAO Prep Studio

A free, static website (plain HTML/CSS/JS, no build step) for preparing for the **LIC AAO (Generalist)** exam from scratch.

## Features
- **24-week / 168-day plan** with daily time blocks, topic order, weekly goals and test days
- **Daily check-ins** (hours, focus, mood, notes), streaks, activity heatmap, calendar (.ics) export
- **Syllabus & notes** for 46 topics: key points, formulas, traps, how to learn, how to practise
- **Practice engine**: unlimited generated Quant/Reasoning/Vocab questions plus a fixed starter bank, with instant explanations
- **Mock tests**: Full Prelims (RE 35 / QA 35 / EN 30, 20-min sectional timers), weekly sectional, mains-style, GK + Insurance
- **Error Notebook** with retry-until-mastered, **Vocabulary flashcards** (spaced repetition), **Writing Lab**, **Current Affairs log**, **Focus timer**, **Formula sheet**, **Exam guide & checklists**
- Works offline (PWA service worker), dark mode, mobile friendly, export/import backup

All progress is stored in your browser's localStorage. Use Settings → Export backup regularly.

## Deploy on GitHub Pages
1. Push this folder to a GitHub repository (branch `main`).
2. In the repo go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/pages.yml`) publishes the site on every push.
   Your site will be at `https://<username>.github.io/<repo>/`.

## Run locally
Open `index.html`, or run `python3 -m http.server` in this folder.

## Important
Exam details (pattern, eligibility, marking, pay) come from the 2025 cycle and coaching-site summaries; the 2026 notification was not out when this was built. **Always verify with the official notification at licindia.in.** The built-in questions are practice material, not LIC's papers.
