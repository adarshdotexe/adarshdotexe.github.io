# adarshdotexe.github.io

Adarsh Varshney's personal site: five screens (Home, About, Work, Résumé, Contact) inside one card layout, plus two old blog posts in `writing/`.

Plain HTML, CSS and ES modules, with no build step.

- `index.html`: all screens. Without JavaScript they stack into one readable page. The Home orbit (`img/art/hero-orbit.svg`) is inlined so its objects can be animated one by one.
- `css/tokens.css`: the palette ("Teal Disc"), one `:root` block. Every colour on the site comes from it. To change the palette, replace this file and update the literal `#F4F3EF` in the `theme-color` meta tags and `site.webmanifest`.
- `css/components.css`: fonts, type/space/radius/motion tokens, then the components, one block each.
- `js/app.js`: hash router and screen transitions, the motion layer (GSAP 3 and SplitText from jsDelivr, loaded only when reduced motion is off, never needed to read the page), the typed rotator, disclosures, contact form, the bat-signal, analytics loader.
- `fonts/`: Clash Grotesk and General Sans (Indian Type Foundry, ITF Free Font License) and Sedgwick Ave (SIL Open Font License), latin subsets.
- `img/art/`: the illustrations, the icon sprite (`icons.svg`) and the favicons. Every illustration animates itself with CSS inside the SVG and stops under reduced motion.
- `img/work-*.webp`: screenshots shown inside the Lokasu and Vilje rows (lokasu.com home page; ViljePDF on a public NIST test drawing).

The CV download is unlinked until `AdarshVarshneyResume.pdf` is regenerated.

Run locally:

```sh
bunx serve .
```

Credits: design system inspired by BreezyCV by LMPixels and the Luique theme by bslthemes. Code, icons and illustrations in this repository are original.
