# adarshdotexe.github.io

Adarsh Varshney's personal site: five screens (Home, About, Work, Résumé, Contact) inside one card layout, plus two old blog posts in `writing/`.

Plain HTML, CSS and ES modules. No build step and no dependencies.

- `index.html`: all screens. Without JavaScript they stack into one readable page.
- `css/tokens.css`: colour, type, spacing, radius, shadow and motion tokens (light and dark).
- `css/components.css`: the components, one block each.
- `js/app.js`: hash router and screen transitions, rotator, disclosures, theme, clock, contact form, analytics loader.
- `fonts/`: Sora and Figtree (latin subsets, SIL Open Font License).

Run locally:

```sh
bunx serve .
```

Credits: design system inspired by BreezyCV by LMPixels. Code, icons and images in this repository are original.
