# Design notes: studied nonchalance

> *Sprezzatura*: "a certain nonchalance, so as to conceal all art and make whatever one
> does or says appear to be without effort." (Castiglione, 1528)

The work is real (a 175x speed-up, a RAG engine people use, a Springer chapter). The page
should present it the way an Apple product page presents a chip: one big number, one
plain sentence, a lot of air, and no shouting. Effort shows up as precision, never as
decoration.

## Principles

1. **One idea per screen.** Each section makes one claim, then gets out of the way.
2. **Type is the visual.** No stock photos or placeholder mountains. Big, tight, confident
   headings and tabular numerals. Images only when they are real (the portrait).
3. **Understatement over adjectives.** "1m 45s → 600 ms" says more than "blazing fast".
   Show the measurement and let the reader say "wow".
4. **Motion confirms, it never performs.** Gentle reveals, one counting number, and a
   frosted bar. No preloader, cursor trail, typing carousel or particle field.
5. **A wink, not a joke.** Keep the personality ("praying that my code works", the coffee,
   "Batman"), but whisper it in the footnotes.
6. **Nothing to maintain.** Static HTML/CSS and about 60 lines of JS. No build step, no
   framework, so GitHub Pages serves it as is.
7. **Respect the reader.** Dark mode follows the system, `prefers-reduced-motion` is
   honoured, it works without JS, and no phone number or home address is published.

## Templates compared

Scores are 1–5. Restraint and type are weighted most, because they are what sprezzatura
is made of. I screenshotted BreezyCV, Luique, Spotlight, vCard and DevPortfolio for this
pass; the others are rated from their public demos.

| Template | Restraint | Type | Motion taste | Fit for this content | Ownability* | Wow | Verdict |
|---|---|---|---|---|---|---|---|
| **BreezyCV** (current, LMPixels) | 2 | 2 | 2 | 4 | 3 | 2 | Every section is present, but it reads like a template: skill bars, preloader, carousel, filler items |
| **Luique** (bslthemes, $24, your reference) | 1 | 4 | 3 | 3 | 3 | 5 | Huge name and stat chips are great. Outline text, dot grids, scribble script and the green disc are too much |
| **Tailwind Plus Spotlight** (paid) | 5 | 4 | 3 | 4 | 3 | 3 | The most Apple-like restraint. Photo strip and quiet "Work" card. A little generic |
| **Magic UI portfolio** (free, MIT) | 4 | 3 | 4 | 5 | 3 | 3 | Blur-fade reveals and a timeline that matches the CV almost 1:1. Same as a thousand others |
| **Magic Portfolio** (Once UI, free) | 3 | 4 | 4 | 4 | 2 | 4 | Polished effects, but a heavy design system to inherit |
| **Brittany Chiang v4** (free, MIT) | 4 | 4 | 3 | 4 | 2 | 3 | Numbered sections and tabbed experience. So copied that it now signals "template" |
| **Aceternity / Magic UI Pro** (paid) | 2 | 3 | 3 | 3 | 2 | 5 | Beams and spotlights. Easy to make loud, the opposite of sprezzatura |
| **Framer templates** (paid) | 4 | 5 | 5 | 3 | 1 | 5 | Best craft, but you rent it: Framer hosting, not your repo |
| **Cruip DevSpace** ($49) | 4 | 4 | 2 | 3 | 4 | 2 | Calm and good for writing-first sites |
| **vCard** (codewithsadee, free) | 3 | 3 | 2 | 4 | 4 | 3 | A cleaner BreezyCV. Same sidebar-card idea, same limits |
| **DevPortfolio** (free) | 4 | 2 | 1 | 3 | 5 | 1 | Honest but flat |
| **3D portfolio** (Three.js) | 1 | 2 | 2 | 2 | 2 | 5 | A spectacle. It hides the work instead of showing it |

\* Ownability: how easily it lives as plain files in this repo on GitHub Pages without
a framework treadmill.

## What was taken from each

| From | Kept | Left behind |
|---|---|---|
| Luique | The name set huge as the hero; the stat chips (as a quiet spec row); the accent dot after the logo; a warm off-white "paper" background | Outline type, script fonts, dot matrices, the coloured disc, the floating side toolbar |
| Apple product pages | One big number per idea ("600 ms"); frosted sticky bar; bento grid; tight negative tracking; generous spacing | Scroll-jacking, autoplay video |
| Spotlight | Restraint, short paragraphs, the "Work" list's rhythm | Rotated photo strip (no photos worth it yet) |
| Magic UI | Soft blur-fade reveal with stagger; one compact timeline for work and education | shadcn/Next.js stack |
| Brittany Chiang | Small mono eyebrow labels on sections; muted dates on the left | Numbered headings, teal-on-navy palette |
| Framer | Hover micro-interactions: cards lift 2 px, arrows nudge ↗ | Hosting lock-in |
| BreezyCV (your old site) | All the content and the jokes | Skill bars, testimonials, preloader, text carousel, contact form, phone and address |

## System

- **Type:** the platform's own UI font (SF Pro on Apple, Segoe UI Variable on Windows),
  with Inter as a fallback. Display at `clamp(3.4rem, 11vw, 9.5rem)`, weight 700, tracking
  `-0.045em`. Body 1.0625rem / 1.6. Numbers use `tabular-nums`.
- **Colour:** paper `#f7f6f2` / ink `#1d1d1f` / muted `#6e6e73` / hairline 8 % ink.
  Dark: `#0a0a0b` / `#f5f5f7` / `#a1a1a6`. One accent, NVIDIA green `#76b900`, used for
  the dot, focus rings and the counter. Nothing else.
- **Space:** an 8 px scale; sections get 160 px of vertical room on desktop.
- **Motion:** 700 ms `cubic-bezier(.2,.7,.2,1)`, 16 px rise plus 6 px blur to sharp,
  60 ms stagger. The hero counter runs 105.0 s → 0.6 s once. All of it is off under
  reduced motion.
