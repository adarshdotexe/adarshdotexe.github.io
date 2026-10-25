# Design notes: Luique's vision, worn lightly

> *Sprezzatura*: "a certain nonchalance, so as to conceal all art and make whatever one
> does or says appear to be without effort." (Castiglione, *The Book of the Courtier*, 1528)

The brief: keep the vision of the old BreezyCV site and of Luique (a rich personal
portfolio with a strong hero, a portrait, services, numbers, a résumé timeline,
achievements, projects, testimonials, writing and contact). Execute it with studied
nonchalance and Apple's habits: rich animation and vector detail that blends into
nothingness, and nothing that looks generated.

**The rule:** every rich thing is load-bearing, and every load-bearing thing is quiet.

## Concept: annotated silicon

Adarsh works on chip power. Each of Luique's decorations is replaced by something from
that world, so the ornament carries meaning:

| Luique | Here | Why |
|---|---|---|
| Teal disc behind the photo | A hairline **wafer**: die grid, a flat edge, a dotted orbit turning once every 120 s | He works on silicon. The orbit is a second hand you only notice if you stare |
| Stat chips ("12+ years") | **Datasheet annotations**: leader lines and a dimension bar. 1 m 45 s → 600 ms visibly shrinks once | "Yes, I measured", his own line, made literal |
| Caveat script subtitle | One copper italic aside, "(yes, I measured)", with an underline that draws itself once | Exactly one human scribble on the page |
| Giant faded section words, dot grids | A **power rail**: one copper trace down the margin, with a 45° jog and a via at each section. It draws as you read and the via of your section lights | Continuity, a reading-progress bar, and PCB manners, at 1 px |
| Services carousel | Four static offerings, each with a 32 px copper line glyph that redraws on hover | Nothing hidden behind arrows |
| Skill percentage bars | **Tools, with receipts**: each tool and where it shipped. The one honest bar survives: "Praying that my code works: 100%" | A percentage of a skill is fiction |
| Counters | A numbers band, final at first paint | No odometers |
| Portfolio grid with stock tiles | Three case studies with **hairline diagrams** (internal work can't have screenshots), then a dense "Also" index | Real evidence over thumbnails |
| Resume accordion | Kept (Luique's best section), using native `<details>`. The current role's via breathes on a 3 s loop | Long CV, calm page |
| Testimonial carousel | Three static italic quotes, labelled honestly ("best friend, so possibly biased") | A quote is text |
| Contact form | Kept: three underline fields, plus a big email address with a quiet Copy button and the live time in Hyderabad | Asks less, gets more |
| Footer | A 22 px coffee cup whose steam drifts on a 6 s loop; hover for his line | The closing wink |

Dropped on purpose: preloader, cursor blob, typing carousel, pricing, offset shadows,
outlined type, burger menu on desktop, icon fonts, emoji, glassmorphism, gradients,
bento cards, mono eyebrow labels, blanket blur-fade reveals.

## System

- **Type:** Newsreader (variable, optical sizes) for display, quotes and asides; Hanken
  Grotesk for text and UI. Neither is a 2025 default. The headline is a sentence with his
  name in it, not "Hi, I'm".
- **Colour:** warm paper `#F3EFE6`, ink `#1B1A17`, two greys, hairlines at 13 % ink.
  The accent is copper `#B4532A` (the colour of the traces he analyses), on under 3 % of
  pixels. Solder-mask green `#3F7D5A` appears only for "live" and "beat the baseline".
  Dark mode is warm charcoal and follows the system; the toggle remembers your choice and
  cross-fades with a View Transition.
- **Motion:** two easings. Only these move: the orbit (120 s), the dimension bar (once),
  the scribble (once), the rail (scroll-linked), the "live" via (3 s), the packets in the
  diagrams, glyph redraw (on hover), the coffee steam (6 s), and a 10 px arrival for blocks
  below the fold. No more than two things move at once. All of it stops under
  `prefers-reduced-motion`, and the page reads fully without JS.
- **Invisible details:** tabular figures for numbers and dates, the real × and → signs,
  `text-wrap: balance/pretty`, hanging punctuation, `color-mix` hover tones, focus rings in
  copper, no layout shift, sticky header with a hairline only after you scroll.

## Copy

Rewritten from a fact base (résumé, old site, GitHub and the Springer page), following a
writing playbook drawn from Zinsser, Pinker, Williams, Orwell, Ogilvy, Apple's product copy
and portfolios such as Rauno Freiberg's, Paco Coursey's, Julia Evans's and Dan Luu's.

- Facts brag; the voice shrugs. Numbers always come with units and baselines.
- One joke per section, at the end, mostly his own lines ("chaos needs tests",
  "Like a lot. A LOT. of coffee.", "occasionally Batman").
- New material that was missing before: the 12 interns, the 4.8/5 teaching rating with
  120 students, the FY2025 top-contributor nod, the paper's actual finding (it beats
  DeepMind's baseline at economy and building and struggles in combat), the merged NVIDIA
  NIM PR to Continue, the NIM patches to vim-ai and Cline, xv6, and automeet.
- Corrections: the Edge AI card no longer links to an unmodified MiVOLO fork.
  d3-hwschematic now credits Michal Orsák's original. The phone number, street address and
  age are gone.

## Templates studied

BreezyCV (the old site) and Luique (the reference) were taken apart section by section.
Tailwind Spotlight, Magic UI, Brittany Chiang v4, Framer templates, rauno.me, paco.me,
emilkowal.ski, linear.app, Apple product pages, Stripe Sessions and Teenage Engineering
were studied for technique; the notes are in the research folder kept outside this repo.
