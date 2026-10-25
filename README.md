# adarshdotexe.github.io

Adarsh Varshney's personal site: six screens (Home, About, Work, Résumé, Blog, Contact) shown one at a time, plus the blog posts in `writing/`.

Plain HTML, CSS and ES modules, with no build step.

- `index.html`: all screens. Without JavaScript they stack into one readable page, and every Work tile renders. On desktop an identity column sits on the left and the nav rail on the right, straight on the paper background (no frame). Below 1024 px there's an identity bar at the top and a dock at the bottom. The Home orbit (`img/art/hero-orbit.svg`) is inlined between the `<!--orbit-->` markers so its objects can be animated one by one.
- `css/tokens.css`: the palette ("Teal Disc"), one `:root` block. Every colour on the site comes from it. To change the palette, replace this file and update the literal `#F4F3EF` in the `theme-color` meta tags and `site.webmanifest`.
- `css/components.css`: fonts, type/space/radius/motion tokens, then the components, one block each. Every card uses the one tile anatomy: thumb, tags, title, one line, and an optional expand. The whole tile is the toggle (a real `<button>` stretched over it, with the plus/minus disc in the corner).
- `js/app.js`: hash router and screen transitions, the motion layer (GSAP 3 and SplitText from jsDelivr, loaded only when reduced motion is off, never needed to read the page), the typed rotator, tile toggles, the progressive Work list (5 tiles, then 4 more each time you scroll or tab to the end), the testimonials scroller, the blog filter, the live Hyderabad clock, copy email, the contact form, a hidden easter egg and the analytics loader.
- `fonts/`: Clash Grotesk and General Sans (Indian Type Foundry, ITF Free Font License) and Sedgwick Ave (SIL Open Font License), latin subsets.
- `img/art/`: the illustrations, the icon sprite (`icons.svg`, v2: strokes in `currentColor`, stroke width from `--icon-stroke`, the duotone fill from `--icon-duo`; `-lg` ids are for 40 px and up) and the favicons. The root `favicon.ico`, `icon.svg` and `apple-touch-icon.png` are copies of the `img/art/` ones for clients that ask for the root paths. Every illustration animates itself with CSS inside the SVG and stops under reduced motion.
- `img/testimonials/`: the five friends' photos (160 px WebP).
- `img/work-*.webp`: screenshots shown inside the Lokasu and Vilje tiles (lokasu.com home page; ViljePDF on a public NIST test drawing).

The CV download is unlinked until `AdarshVarshneyResume.pdf` is regenerated.

## Adding a blog post or review

1. In `index.html`, find the Blog screen (`<section ... id="blog">`) and copy one `<li class="tile post" ...>` card.
2. Set `data-cat` (`reviews`, `personal` or `teaching`), the tag text, the `<time>` date (`16 Sept 2022` style, with a `datetime`), the title and its `aria-label` ("Read: …"), the link, and a one-line teaser of at most 12 words. Use `img/art/blog-*.svg` as the thumb, or a sprite icon in a `thumb thumb-icon` (see the Reviews card).
3. Copy `writing/hello-world.html` to `writing/<slug>.html` and replace the title, meta description, date, art and body.
4. Newest posts go first. When the first review ships, drop "(soon)" from the Reviews chip and delete the empty-state card (`post-empty`).

## Run locally

```sh
bunx serve .
```

Credits: design system inspired by BreezyCV by LMPixels and the Luique theme by bslthemes. Code, icons and illustrations in this repository are original.
