# adarshdotexe.github.io

Adarsh Varshney's personal site: five screens (Home, About, Work, Résumé, Contact) inside one card layout, plus two old blog posts in `writing/`.

Plain HTML, CSS and ES modules, with no build step.

- `index.html`: all screens. Without JavaScript they stack into one readable page.
- `css/tokens.css`: the palette, one `:root` block. Every colour on the site comes from it, so a new palette is a drop-in replacement of this file (then update the literal `#0D1114` in the `theme-color` meta tags and `site.webmanifest`).
- `css/components.css`: fonts, type/space/radius/motion tokens, then the components, one block each.
- `js/app.js`: hash router and screen transitions, rotator, disclosures, contact form, the bat-signal, analytics loader.
- `fonts/`: Sora and Figtree (latin subsets, SIL Open Font License).
- `img/work-*.webp`: project thumbnails (lokasu.com home page; ViljePDF on a public NIST test drawing).

The CV download is unlinked until `AdarshVarshneyResume.pdf` is regenerated.

Run locally:

```sh
bunx serve .
```

Credits: design system inspired by BreezyCV by LMPixels. Code, icons and images in this repository are original.
