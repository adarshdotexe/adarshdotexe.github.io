# adarshdotexe.github.io

Adarsh Varshney's personal site: six screens (Home, About, Work, Résumé, Blog, Contact) shown one at a time, plus the blog posts in `writing/`.

Plain HTML, CSS and ES modules. Nothing has to be built to serve it; the one generated file is `js/app.min.js` (see below).

- `index.html`: all screens. Without JavaScript they stack into one readable page, and every Work tile renders. On desktop an identity column sits on the left and the nav rail on the right, straight on the paper background (no frame), all inside one centred shell (`--shell-max`, 1320 px): on wider screens the spare width becomes two equal side gutters, so the column, the content and the rail stay one composition. The rail comes after `<main>` in the DOM so Tab reaches the content first. Below 1024 px there's an identity bar at the top and a dock at the bottom. The Home orbit is inlined between the `<!--orbit-->` markers so its objects can be animated one by one; its colours are `currentColor` and palette tokens, so edit it there.
- `css/tokens.css`: the palette ("Teal Disc"), one `:root` block. Every colour on the site comes from it. To change the palette, replace this file and update the literal `#F4F3EF` in the `theme-color` meta tags and `site.webmanifest`.
- `css/components.css`: fonts, type/space/radius/motion tokens, then the components, one block each. Type sizes are one fluid `clamp()` scale (360 px phone to 1920 px screen) and the content width is one token (`--content`). Every card uses the one tile anatomy: thumb, a muted meta line (Work, Blog, the writing pages), title, one line, and an optional expand (public links sit inside it, after the paragraph). Thumbs are 128 px wide in narrow lists and 200 px once the list is 640 px wide; once the screen is 600 px wide (a 1024 px laptop and up), Work becomes a two-column grid and Blog a three-column grid of the same card with the art on top, and from 700 px About's What I Do is a 2 × 2 grid with the art beside the words. An open Work or About card takes the whole row. The title is the toggle: a real `<button>` inside the heading whose `::after` covers the tile, with a flat plus/minus disc (outlined on hover, focus and when open); the one line stays selectable text. Résumé rows are a plain list split by hairlines, with a small chevron after each name instead of a disc, and the skills are one line of words. There are two surfaces: `.tile` and the larger panels (form, testimonial cards).
- `js/vendor/`: GSAP 3.15 core (`gsap.min.js`, GreenSock standard no-charge license), self-hosted. The head script in `index.html` fetches it without blocking the page, only when reduced motion is off. Nothing waits for it: the decorative orbit starts hidden (2 s safety timer), and if GSAP is in before the first paint the Home intro also hides the greeting and the name's letters for under a second while they rise. The title and name splitting is done in `app.js` (no SplitText).
- `js/app.js` (readable source) and `js/app.min.js` (what the pages load): hash router and screen transitions (the old screen slides out in 0.08 s, then the new one fades in while it glides in from its side and its title words rise and the first tiles stagger up; about 0.4 s, interruptible, and two screens never share a frame), the Home intro (disc overshoot, portrait pop, the name rising letter by letter, orbit objects popping in, then the rotator types; about 1.3 s), the motion layer, the typed rotator, tile toggles, the progressive Work list (4 tiles, hidden from the first paint by CSS; 4 more each time the end of the list comes within 600 px, or you tab to it), the testimonials scroller, the blog filter, the live Hyderabad clock, copy email, the contact form, a hidden easter egg (type "batman", or tap the Home clapperboard three times; a "tap me ×3" hint appears 6 s into the second Home visit of a session until it has been found), the orbit's rest (its ambient CSS loops run for 5 s whenever Home appears, then pause until the pointer comes back or a new rotator title wakes them for 2 s, for WCAG 2.2.2; the rotator pauses on hover, on focus inside the hero text and on a tap) and the analytics loader.

After editing `js/app.js`, regenerate the loaded file from the repo root:

```sh
bun build js/app.js --minify --outfile js/app.min.js
```
- `fonts/`: Clash Grotesk and General Sans (Indian Type Foundry, ITF Free Font License) and Sedgwick Ave (SIL Open Font License), latin subsets.
- `img/art/`: the illustrations, the icon sprite (`icons.svg`, v3: strokes in `currentColor`, stroke width from `--icon-stroke`, the duotone fill from `--icon-duo`; `-lg` ids are for 40 px and up) and the favicons. The root `favicon.ico`, `icon.svg` and `apple-touch-icon.png` are copies of the `img/art/` ones for clients that ask for the root paths. Every illustration animates itself with CSS inside the SVG and stops under reduced motion. Every list thumb is a small scene on the same teal disc, dot patch and shelf line, so all of them are one family.
- `img/testimonials/`: the five friends' photos (160 px WebP).
- `img/work-*.webp`: screenshots shown inside the Lokasu and Vilje tiles (lokasu.com home page; ViljePDF on a public NIST test drawing).

`AdarshVarshney-CV.pdf` is a one-page CV built only from facts already on the site (no phone, no street address). Its source is `cv.html` in the research folder, printed with headless Edge (`--print-to-pdf`). It is linked from the identity column and the Résumé screen. Replace the file to update it.

## Friends' LinkedIn links (testimonials)

Each friend's name on About is `<a class="who" data-linkedin="">Name</a>`. Without an `href` it is plain text (no broken link). To link a friend, paste their profile URL into both attributes:

```html
<a class="who" href="https://www.linkedin.com/in/their-profile/" data-linkedin="https://www.linkedin.com/in/their-profile/">Nelli James<svg …></a>
```

The name then becomes an external link with a small LinkedIn icon, and works without JavaScript. Alternatively fill the `LINKEDIN` map at the top of `js/app.js`; it is applied on page load to any name whose `href` is still empty.

## Swapping the portrait

The site uses one photo everywhere: `img/portrait-face-{96,240,336,480}.webp`, a head-and-shoulders crop of `img/portrait.jpg` (a 260 px square at x 270, y 136, so the face sits a little above the centre of every circle). The three `<img>`s that show it (Home hero, identity column, mobile bar) are marked `data-portrait`; the blog pages use the same files. To use a better photo later, save it as `img/portrait.jpg` and run this one line from the repo root, changing `S:S:X:Y` (crop size and top-left corner, in source pixels) to frame the new face:

```sh
for w in 96 240 336 480; do ffmpeg -y -i img/portrait.jpg -vf "crop=260:260:270:136,scale=$w:$w:flags=lanczos" -c:v libwebp -quality 86 img/portrait-face-$w.webp; done
```

No HTML changes are needed. (`img/og.jpg` is rendered from the same crop; re-render it if the photo changes.)

## Adding a blog post or review

1. In `index.html`, find the Blog screen (`<section ... id="blog">`) and copy one `<li class="tile post" ...>` card.
2. Set `data-cat` (`reviews`, `personal` or `teaching`), the category word in the `tile-meta` line, the `<time>` date (`16 Sep 2022` style, with a `datetime`), the title and its `aria-label` ("Read: …"), the link, and a one-line teaser of at most 12 words. Use an `img/art/blog-*.svg` illustration as the thumb (see the Reviews card).
3. Copy `writing/hello-world.html` to `writing/<slug>.html` and replace the title, meta description, date, art and body.
4. Newest posts go first. When the first review ships, drop "(soon)" from the Reviews chip and delete the empty-state card (`post-soon`). The filter chips are `hidden` until two categories have two posts each; then delete that attribute.

## Run locally

```sh
bunx serve .
# then open http://localhost:3000
```

Credits: design system inspired by BreezyCV by LMPixels and the Luique theme by bslthemes.
