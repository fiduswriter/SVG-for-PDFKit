# Merge Evaluation: SVG-to-PDFKit

Goal: evolve this fork into a version supporting as much of the SVG standard as
possible by merging the 8 open PRs on `alafr/SVG-to-PDFKit` plus the useful,
currently unmerged changes scattered across the fork network.

Research date: 2026-08-10, against `alafr/SVG-to-PDFKit` `master` (`b091ebd`).

---

## 0. Current state of this fork (`karmacod3r/SVG-to-PDFKit`)

This fork is a descendant of the *latest* upstream `master` (`b091ebd`), so it
already contains every PR merged upstream before 2026, including:
- zeros in `stroke-dasharray` (#162) and negative `stroke-dashoffset` recovery
- dominant-baseline fix (#163), PDFKit-as-devDependency (#160)
- name-mangling-insensitive pattern lookup (#168)
- vector-effect support (#148), classList handling (#146)
- TypeScript typings (#135), error message from font open failure (#150)

On top of upstream it uniquely adds:
- **CMYK color support** (`options.cmyk`, `rgb2cmyk()`, `cmyk(...)` parsing)
- **Spot colors** adapted from `alvarcarto/SVG-to-PDFKit` (PDF Separation-ish via
  `colorSpaces` on groups/`docEndGroup`)
- **PDFKit dependency update** + **typings** update

Net: the biggest missing gaps are text/transform/rendering features, many of
which are exactly what the open PRs and other forks provide.

---

## 1. The 8 open PRs on the official repo

Each currently `mergeable_state: clean` unless noted.

### PR #188 — `hsl()` / `hsla()` color parsing (petrkotek) — **HIGH VALUE, MERGE**
- Adds `hsl()`/`hsla()` color formats to `parseColor` (+~45 lines, self-contained).
- Necessary for real-world SVG (many tools emit HSL). Directly expands the
  supported CSS color space.
- The author's fork adds two follow-ups not in the PR: optional `deg` on hue, and
  fix for **decimal** values in `hsl()`. Combine all three.
- File: `source.js` only. Clean, testable.

### PR #191 — `<marker orient="auto-start-reverse">` (petrkotek) — **MERGE**
- Small (~10 lines) fix: treats `auto-start-reverse` like `auto` but rotates the
  start marker by 180°. Correct per SVG 1.1/2 spec.
- Plus: closes the marker support gap (`orient` already existed for `auto`/angle).
- File: `source.js` only.

### PR #171 — style resolution precedence order (eriese) — **MERGE (important bug fix)**
- Fixes that presentation *attributes* should override *style* (`style=`), which
  should override *CSS rules* — upstream had the first two swapped.
- Also guards `classList.contains` for `DOMTokenList`/`Array` (`contains`/`includes`),
  matching the fix in fork `angusscown`.
- Correct precedence is core correctness for the CSS-in-SVG pipeline.
- File: `source.js` only.

### PR #176 — pass font-weight to `fontCallback` (mewtlu) — **MERGE (see §2 conflict note)**
- Changes `fontCallback` to receive the resolved `font-weight` string
  (`'normal'|'bold'|'bolder'`) instead of a boolean, and classifies 800/900 as
  `bolder`.
- `fontCallback` is a breaking-change to a public callback signature. Several
  forks (Better-Boards, creately, helio3197, leduard) touch the same code — see
  §2 for a unified design. Files: `index.d.ts` + `source.js`.

### PR #166 — nested `<!DOCTYPE` with internal subset — **MERGE**
- 2-line parser branch to accept `<!DOCTYPE ... [ ... ]>` (nested/internal subset),
  required for SVGs exported by some tools with embedded DTDs.
- File: `source.js` only.

### PR #157 — `transform-origin` (adamwong246) — **PARTIAL / IMPROVE**
- Implements `transform-origin` (~873 lines incl. test artifacts). Correct math
  wrapping a translate-origin around the transform matrix.
- Known-incomplete per author: only 2 absolute or 2 percentage values; no keywords
  (`top/left/center`), no single-value, no 3D. Includes stray `console.error`,
  `yarn.lock`, test PDF.
- **Do not merge as-is.** Fold in fork `boldx`'s improvements (floating-point
  parsing, `px`, applying to text nodes) and finish keywords + single values, or
  merge only the robust core with tests. File: `source.js`.

### PR #68 — `translate3d` (stocksr) — **MERGE WITH FIX (low priority)**
- Adds `translate3d` in the trivial case (`translate3d(x, y, 0)`) and strips `px`.
- Has a latent bug: it checks `nums.length === 2` for `translate3d` instead of 3
  (lucky only because the regex change plus 2-arg check happens to work for the
  degenerate case). Marked `dirty` (conflicts with newer upstream).
- Worth including (translate3d appears in minified front-end output), but needs
  a correct reimplementation.
- File: `source.js` only.

### PR #62 — Spot Colors (ziaenezhad) — **SUPERSEDED / DO NOT MERGE AS-IS**
- 854/699 lines; the broadest change. Marked `dirty`.
- **Overlaps with the spot-color + CMYK work this fork already has.** Review for
  anything beyond the existing fork feature (e.g. named `Separation` color spaces,
  `spotcmyk`). If the fork's implementation is sufficient, skip the PR and keep
  the fork version; otherwise cherry-pick only the missing piece.

---

## 2. Valuable features from unmerged forks (network)

Ranked by SVG-standard value / usefulness / fix quality.

### F1 — Blend modes `mix-blend-mode` on groups (Kittl, 14 commits) — **HIGH**
`applyBlendMode()` writes a PDF `ExtGState` with `BM`, applied to a group when a
container has `mix-blend-mode` in its style. This is a genuine SVG/CSS compositing
feature (multiply/screen/overlay/darken/lighten/…). Files: `source.js`. Merge the
`applyBlendMode` + `getObjectStyles` + `parseCSSBlendMode` diff, trimmed to this
fork.

### F2 — `mask-type: alpha|luminance` (leduard, 6 commits) — **MEDIUM-HIGH**
Lets `<mask>` use `SMask /S Alpha` instead of the hard-coded `Luminosity`. Correct
per SVG — currently the library always treats masks as luminance. Small, isolated.
Files: `source.js`.

### F3 — Image-open error forwarding (Kittl) — **MERGE (tiny)**
`warningCallback(..., e)` on `doc.openImage` failure. 1 line, clean DX improvement.

### F4 — `fontCallback` redesign cluster — **CO-DESIGN, don't merge blindly**
Six different forks/PRs touch `fontCallback` and conflict:
- PR #176 / Better-Boards: pass resolved `font-weight` (string) instead of bool.
- creately: `fontCallback` may return an object `{fontNameorLink, fauxBold, fauxItalic}`
  so faux styles come from the callback.
- helio3197: weight-variant font names (`Family-400`…`Family-900`) + family whitespace strip.
- leduard: pass the current element stack so the callback can choose per element.
- rpilker: add `fontVariants` + per-element variants; fix `tnums`→`tnum`.

These should be **unified into one coherent `fontCallback` signature** (family,
weight, italic, fontOptions, elementStack) before merging, otherwise you get
breaking/conflicting API churn.

### F5 — `pointsPerInch` option (rpilker, 3 commits) — **MERGE (small, self-contained)**
Makes the px→pt conversion configurable (defaults stay at 72). Useful for
non-point PDF workflows. Files: `source.js` (+types).

### F6 — Spot-color string robustness (fiberjungle, 4 commits) — **MERGE (bug fixes to existing feature)**
- `docFillColor`/`docStrokeColor`: handle the case where a spot color is passed as
  a bare string by wrapping as `[color, 1]` (not `[color]`).
- Emit `ColorSpace` entries from `doc.spotColors` into group resources so spot
  colors actually resolve inside groups.
- Corrects `object === undefined` fallback for `url(...) ...` fill parsing.
High value: fixes the fork's existing spot-color feature in grouped/shaped output.

### F7 — 0-width glyphs (noteflight/SVG-to-PDFKit-NFFork, 1 commit) — **MERGE (tiny correctness fix)**
Remove the `isNotEqual(pos[j].width, 0)` guard so 0-width-invisible-but-positioned
glyphs (used by music notation / spacing) are still emitted. Small and safe.

### F8 — `getComputedStyleCallback` (jacobbubu, 18 commits) — **OPTIONAL**
Lets callers supply computed styles (esp. for Node + jsdom). Useful but overlaps
with the `useCSS` path; lower priority and larger surface.

### F9 — Before/after drawing callbacks, element-drawing callback, xform return
(jacobbubu) — **OPTIONAL.** Useful instrumentation; out of core SVG scope.

### F10 — Color books / `parseColorCallback` (jacobbubu) — **OPTIONAL.** Requires a
forked PDFKit; note this dependency. Related to spot colors but heavier.

### F11 — transform-origin improvements (boldx + ChromaPDX) — merge into PR #157 work
Floating-point + `px` parsing, and applying to text nodes. Include whatever falls
out of the PR #157 cleanup.

### F12 — `_pos`/dasharray extras (nowifi4u, SoSocio, angusscown) — **mostly already covered**
- SoSocio zeros-in-dasharray and angusscown classList fix are already in upstream
  master (#162/#146) → no action.
- nowifi4u's extra dashArray normalize loop — verify against current `docApplyDash`;
  likely already covered.

---

## 3. Recommended merge plan (SVG-standard maximization)

**Tier 1 — merge as-is (clean, self-contained, correctness/features):**
1. #188 hsl/hsla (+ fork `deg` + decimal fixes)
2. #191 `auto-start-reverse` markers
3. #171 style precedence + classList guard
4. #166 nested DOCTYPE
5. #68 translate3d — but reimplement correctly (3-arg, px strip)
6. F2 mask-type alpha/luminance
7. F3 image-error forwarding
8. F5 pointsPerInch
9. F6 spot-color string/group robustness fixes
10. F7 0-width glyphs

**Tier 2 — co-design before merging (public API, multiple conflicts):**
- F4 unified `fontCallback` (weight + faux-styles object + element stack + variants)
  — merge PR #176 + creately + helio3197 + leduard + rpilker as one feature.
- Blends F1 (Kittl) — merge but review group-resource handling with F6.

**Tier 3 — more work / partial:**
- #157 transform-origin — finish keywords/single-values + fold in boldx; then merge.
- #62 spot colors — reconcile with the fork's existing CMYK/spot support, keep or
  extend, don't wholesale-replace.
- F8/F9/F10 jacobbubu instrumentation — optional, decide scope.

**Resulting feature matrix gained (beyond current fork):**
hsl/hsla colors · transform-origin · translate3d · mix-blend-mode · marker
auto-start-reverse · correct CSS precedence · alpha masks · configurable DPI ·
robust spot colors · flexible font loading · nested DTDs · image-error UX ·
0-width glyph fidelity.

Still explicitly **unsupported** by the SVG standard (not covered above and out of
the current PR/fork set): filters (`filter`/`fe*`), `foreignObject`,
`textLength`/`writing-mode`/`unicode-bidi` (partial), `font-variant`,
`stroke-dashoffset` corner cases, CSS transitions/animations, `href`-based
external references, and `<script>`/SMIL. These would need new work rather than
merges.
