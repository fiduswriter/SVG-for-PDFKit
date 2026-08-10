# TODO: Full static SVG support

This documents what is still needed for SVG-for-PDFKit to support as much of the
*static* SVG standard as possible. "Static" means: no scripts, no SMIL
animations, no CSS transitions/keyframes (they have no meaningful PDF
representation). The reference specs are:

- **SVG 1.1 (Second Edition)** — https://www.w3.org/TR/SVG11/
- **SVG 2** — https://www.w3.org/TR/SVG2/
- **CSS (colors, transforms, filters, text)** — https://www.w3.org/TR/css-*

Items are grouped by area, with a rough priority (H/M/L). Existing support is
noted where useful so it isn't re-implemented.

---

## 1. Filters (`<filter>` / `fe*`) — H
Currently **unsupported**. This is the single biggest gap and one of the most
requested features.
- [ ] Implement `<filter>` element parsing (filter region, `filterUnits`,
      `primitiveUnits`, `filterRes`).
- [ ] Implement filter primitives: `feGaussianBlur`, `feOffset`, `feBlend`,
      `feColorMatrix`, `feFlood`, `feMerge`/`feMergeNode`, `feComposite`,
      `feMorphology`, `feTile`, `feImage`, `feTurbulence`, `feComponentTransfer`,
      `feDisplacementMap`, `feDropShadow` (SVG 2).
- [ ] Map to PDF soft masks / blend modes where possible; PDF has no native
      filter graph, so this requires rasterizing or emulating primitives.
- [ ] `filter` presentation property + `filter` attribute on shapes.
- Reference: SVG 1.1 §15, SVG 2 §6.

## 2. Text & fonts — H
Already supports text, tspan, textPath, x/y/dx/dy/rotate, text-anchor,
textLength, word/letter-spacing, font-size/family/style/weight, direction.
Missing:
- [ ] `font-variant` (small-caps etc.) — listed as unsupported. Implement
      small-caps via faux scaling, map advanced variants if fonts allow.
- [ ] `writing-mode` / `unicode-bidi` — vertical & BiDi text layout. Hard; needs
      vertical glyph placement and RTL chunk reordering.
- [ ] `textLength` improvements — currently partial; verify length
      adjust/spacing behavior (`textLength` + `lengthAdjust`).
- [ ] `kerning`, `letter-spacing`/`word-spacing` in all edge cases.
- [ ] Rich text in `tspan` (x/y/dx/dy offset inheritance) full compliance.
- [ ] `text-decoration` rendering options (underline/overline/line-through
      already partially handled — verify thickness & placement).
- [ ] `<glyph>`/`<altGlyph>` and `font-face-*` descriptor support.
- [ ] `textPath` attributes (`startOffset`, edge cases, multiple paths per SVG2).
- Reference: SVG 1.1 §10, §11, §17, §20; SVG 2 §11, §12.

## 3. Transforms — M
- [x] `transform` (matrix/translate/rotate/scale/skew/translate3d-when-planar)
- [x] `transform-origin` (absolute, percentage, keyword forms — incl. single value)
- [ ] True 3D transforms (`translate3d` with z≠0, `rotate3d`, `perspective`,
      `matrix3d`) — only planar is supported; document limitation, no PDF rep.
- [ ] `transform-box` property (SVG2) to choose the reference box for
      transform-origin/positioning.
- Reference: SVG 1.1 §7, SVG 2 §8; CSS Transforms.

## 4. Colors & painting — M
- [x] rgb, rgba, hex, named, hsl, hsla, cmyk, currentColor, transparent, spot
- [x] fill/stroke/color, fill-opacity/stroke-opacity/opacity, fill-rule
- [ ] `color-interpolation`, `color-interpolation-filters` (linearRGB vs sRGB).
- [ ] `color-rendering`, `shape-rendering` hinting (may map to PDF AA settings).
- [ ] `stop-color`/`stop-opacity` completeness within gradients.
- [ ] `paint-order` (fill/stroke/markers order).
- [ ] `stroke`/`fill` with `context-fill`/`context-stroke`/`context-value`
      (SVG2 `context-*` values) — currently only partially handled.
- Reference: SVG 1.1 §11, §16; SVG 2 §7.

## 5. Clip paths & masks — M
- [x] `<clipPath>` (`clip-path`, `clipPathUnits`), `<mask>` (luminance & alpha
      via `mask-type`).
- [ ] `clip-rule` already present. `clipPathUnits="objectBoundingBox"` present.
- [ ] Mask `maskUnits`/`maskContentUnits`, `x`/`y`/`width`/`height` defaults
      (partially handled).
- [ ] Nested clip paths and masks combined with groups/opacity edge cases.
- Reference: SVG 1.1 §14.

## 6. Gradients & patterns — M
- [x] linear & radial gradients, `spreadMethod`, `href`.
- [x] patterns.
- [ ] `gradientTransform`/`patternTransform` precedence correctness.
- [ ] `stop` percent vs unit mixing; `objectBoundingBox` vs `userSpaceOnUse`
      consistency across all shapes.
- [ ] Gradient color-interpolation (sRGB paths for `stop-color`).
- [ ] Mesh gradients (SVG 2) — likely out of scope for static rendering.
- Reference: SVG 1.1 §13; SVG 2 §6.

## 7. Shapes & paths — M
- [x] rect, circle, ellipse, line, polyline, polygon, path (bezier, arc).
- [x] markers, vector-effect (non-scaling-stroke).
- [ ] Full path data edge cases: `Z` with implied lineto, arc `large-arc-flag`
      rounding, multiple `M` subpaths, empty segments (mostly handled).
- [ ] `stroke-linecap: round/square` + dash interplay verification.
- [ ] `stroke-miterlimit`, `stroke-linejoin` detailed compliance.
- [ ] `d` attribute in presentation form / `style="d:..."`.
- Reference: SVG 1.1 §8, §9.

## 8. Structural & references — L
- [x] `use`, `symbol`, nested `svg`, `g`, `a`, links (internal & external).
- [x] `viewBox`/`preserveAspectRatio`, `x`/`y`/`width`/`height`.
- [ ] `<switch>` (with `requiredFeatures`, `requiredExtensions`, `systemLanguage`
      conditionals).
- [ ] External document references via `href` (`<image>`, `<use>`, gradients,
      patterns) — `documentCallback` partially handles this; verify async/fetch.
- [ ] `<defs>` contents should never render directly (verify).
- Reference: SVG 1.1 §4, §5, §12.

## 9. Images — L
- [x] `<image>` with `imageCallback`, error forwarding.
- [ ] `preserveAspectRatio` on `<image>`.
- [ ] Better handling of embedded/base64 data URIs + hires vs vector scaling.
- Reference: SVG 1.1 §12.

## 10. Interactivity / structural extras (lower priority for *static*) — L
- [ ] `<foreignObject>` — no meaningful static-PDF representation; document as
      unsupported (won't render HTML).
- [ ] `cursor`, `pointer-events`, `on*` event attributes — no PDF meaning.
- [ ] `<script>`, `<style media>`, SMIL `<animate>/<set>/<animateTransform>` —
      out of scope (static).
- [ ] `<title>`, `<desc>`, `<metadata>` — metadata; could map to PDF
      document-info. Nice-to-have.
- [ ] `<a>` with internal anchors/#page navigation links.

## 11. Rendering quality / correctness — M
- [ ] Numerical precision/smoothing (`precision` option) across all operators.
- [ ] AA / `shape-rendering` mapping to PDF (no direct control in PDFKit;
      investigate `doc._opacity`/stroke hints).
- [ ] Bounding-box correctness for groups with transforms & clip paths
      (getPageBBox caching) — verify no regressions after transform-origin.
- [ ] A real test suite — currently there are **no automated tests**. Add a
      node-based render-and-assert suite (compare generated PDF operator
      sequences and/or pixel-render with a viewer). This is a prerequisite for
      safely landing the higher-risk items above (filters, text layout,
      transform-origin edge cases).

---

## Suggested implementation order
1. Build a proper test/regression harness (blocker for everything risky).
2. Filter support (biggest user demand) starting with `feGaussianBlur`,
   `feOffset`, `feMerge`, `feColorMatrix`, `feFlood`.
3. `font-variant` (small-caps) + `lengthAdjust`/`textLength` correctness.
4. `paint-order`, `context-*` paint values, `transform-box`.
5. `<switch>` + full external-reference handling.
6. Vertical `writing-mode`/BiDi (hardest text item; deprioritize if too costly).
7. `<title>/<desc>/<metadata>` → PDF info, internal link anchors.

## Note on spec version
The library is built around the **SVG 1.1 element/property model**, extended
with several **SVG 2** additions (e.g. `mix-blend-mode`, `transform-origin`,
`mask-type`, `context-stroke`). When a property differs between SVG 1.1 and SVG 2,
current behavior is generally: **SVG 1.1 for the base model, SVG 2 additions
where implemented**. `transform-origin`, `mix-blend-mode` and `mask-type` are
SVG 2 / CSS additions. Where this matters it should be stated per-property in the
docs.
