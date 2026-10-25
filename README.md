# adarshdotexe.github.io

Adarsh Varshney's personal site: six screens (Home, About, Work, Résumé, Blog, Contact) shown one at a time, plus the blog posts in `writing/`.

Plain HTML, CSS and ES modules, with no build step.

- `index.html`: all screens. Without JavaScript they stack into one readable page, and every Work tile renders. On desktop an identity column sits on the left and the nav rail on the right, straight on the paper background (no frame). Below 1024 px there's an identity bar at the top and a dock at the bottom. The Home orbit (`img/art/hero-orbit.svg`) is inlined between the `<!--orbit-->` markers so its objects can be animated one by one.
- `css/tokens.css`: the palette ("Teal Disc"), one `:root` block. Every colour on the site comes from it. To change the palette, replace this file and update the literal `#F4F3EF` in the `theme-color` meta tags and `site.webmanifest`.
- `css/components.css`: fonts, type/space/radius/motion tokens, then the components, one block each. Every card uses the one tile anatomy: thumb, tags, title, one line, a links row and an optional expand. The title is the toggle: a real `<button>` inside the heading whose `::after` covers the tile, with the plus/minus disc in the corner; the one line stays selectable text. There are two surfaces: `.tile` and the larger panels (form, testimonial cards).
- `js/app.js`: hash router and screen transitions (a 0.3 s crossfade: the old screen is pinned and fades while the new one slides in; entrances only on the first visit), the motion layer (GSAP 3 and SplitText from jsDelivr, loaded only when reduced motion is off, never needed to read the page), the typed rotator, tile toggles, the progressive Work list (5 tiles, hidden from the first paint by CSS; 4 more each time the end of the list comes within 600 px, or you tab to it), the testimonials scroller, the blog filter, the live Hyderabad clock, copy email, the contact form, a hidden easter egg (type "batman", or tap the Home clapperboard three times) and the analytics loader.
- `fonts/`: Clash Grotesk and General Sans (Indian Type Foundry, ITF Free Font License) and Sedgwick Ave (SIL Open Font License), latin subsets.
- `img/art/`: the illustrations, the icon sprite (`icons.svg`, v3: strokes in `currentColor`, stroke width from `--icon-stroke`, the duotone fill from `--icon-duo`; `-lg` ids are for 40 px and up) and the favicons. The root `favicon.ico`, `icon.svg` and `apple-touch-icon.png` are copies of the `img/art/` ones for clients that ask for the root paths. Every illustration animates itself with CSS inside the SVG and stops under reduced motion. The Work thumbs without a hand-drawn scene (`work-continue`, `-schematic`, `-dotfiles`, `-mest`, `-games`, `-automeet`, `-xv6`, plus `do-films` and `blog-reviews`) compose two `-lg` sprite icons on the same teal disc, dot patch and ground line, so every list thumb is one family.
- `img/testimonials/`: the five friends' photos (160 px WebP).
- `img/work-*.webp`: screenshots shown inside the Lokasu and Vilje tiles (lokasu.com home page; ViljePDF on a public NIST test drawing).

There is no CV file in the repo at the moment; a regenerated CV will be added and linked from the identity column.

## Adding a blog post or review

1. In `index.html`, find the Blog screen (`<section ... id="blog">`) and copy one `<li class="tile post" ...>` card.
2. Set `data-cat` (`reviews`, `personal` or `teaching`), the tag text, the `<time>` date (`16 Sep 2022` style, with a `datetime`), the title and its `aria-label` ("Read: …"), the link, and a one-line teaser of at most 12 words. Use an `img/art/blog-*.svg` illustration as the thumb (see the Reviews card).
3. Copy `writing/hello-world.html` to `writing/<slug>.html` and replace the title, meta description, date, art and body.
4. Newest posts go first. When the first review ships, drop "(soon)" from the Reviews chip and delete the empty-state card (`post-empty`). The filter chips are `hidden` until two categories have two posts each; then delete that attribute.

## Run locally

```sh
bunx serve .
```

Credits: design system inspired by BreezyCV by LMPixels and the Luique theme by bslthemes.
