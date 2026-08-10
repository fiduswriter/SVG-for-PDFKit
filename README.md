# SVG-for-PDFKit

Insert SVG into a PDF document created with PDFKit.

This is a maintained fork of [SVG-to-PDFKit](https://github.com/alafr/SVG-to-PDFKit)
by [alafr](https://github.com/alafr). It merges most of the open pull requests
and the best unmerged features from the fork network, with the goal of
supporting as much of the static SVG standard as possible.

## Install

    npm install svg-for-pdfkit --save

## Use

    SVGtoPDF(doc, svg, x, y, options);

&nbsp; &nbsp; If you prefer, you can add the function to the PDFDocument prototype:

    PDFDocument.prototype.addSVG = function(svg, x, y, options) {
      return SVGtoPDF(this, svg, x, y, options), this;
    };

&nbsp; &nbsp; And then simply call:

    doc.addSVG(svg, x, y, options);

## Parameters

    doc [PDFDocument] = the PDF document created with PDFKit
    svg [SVGElement or string] = the SVG object or XML code
    x, y [number] = the position where the SVG will be added
    options [Object] = >
      - width, height [number] = initial viewport, by default it's the page dimensions
      - preserveAspectRatio [string] = override alignment of the SVG content inside its viewport
      - useCSS [boolean] = use the CSS styles computed by the browser (for SVGElement only)
      - fontCallback [function] = function called to get the fonts, see source code
      - imageCallback [function] = same as above for the images (for Node.js)
      - documentCallback [function] = same as above for the external SVG documents
      - colorCallback [function] = function called to get color, making mapping to CMYK possible
      - warningCallback [function] = function called when there is a warning
      - assumePt [boolean] = assume that units are PDF points instead of SVG pixels
      - pointsPerInch [number] = points per inch used in the px→pt conversion (default = 72)
      - cmyk [boolean] = convert predefined/named colors to CMYK
      - precision [number] = precision factor for approximative calculations (default = 3)

## Fonts
In the browser, it's easier to register fonts (<a href="https://github.com/foliojs/pdfkit/issues/623#issuecomment-284625259">see here how</a>) before calling SVGtoPDF. SVGtoPDF doesn't wait for font loading with asynchronous XMLHttpRequest.

Make sure to name the fonts with the exact pattern 'MyFont', 'MyFont-Bold', 'MyFont-Italic', 'MyFont-BoldItalic' (case sensitive), if the font is named font-family="MyFont" in the svg. Missing Bold, Italic, BoldItalic fonts are simulated with stroke and skew angle.

If your fonts don't follow this pattern, or you want to register fonts at the moment they are encountered in the svg, you can use a custom fontCallback function.

`fontCallback(family, weight, italic, fontOptions[, elementStack])` receives the
font family, the resolved font-weight (`'normal'`, `'bold'` or `'bolder'`), whether
the font is italic, and a `fontOptions` object (`{fauxItalic, fauxBold}`) that you
may mutate to request faux styles. It may return the font name/link as a string,
or an object `{fontNameorLink, fauxBold, fauxItalic}`. The optional `elementStack`
gives the chain of SVG elements so the font can be chosen per element.

## Demos
&nbsp; &nbsp; <a href="https://alafr.github.io/SVG-to-PDFKit/examples/demo.htm" target="_blank">https://alafr.github.io/SVG-to-PDFKit/examples/demo.htm</a>

&nbsp; &nbsp; <a href="https://alafr.github.io/SVG-to-PDFKit/examples/options.htm" target="_blank">https://alafr.github.io/SVG-to-PDFKit/examples/options.htm</a>

## NodeJS example
&nbsp; &nbsp; <a href="https://runkit.com/alafr/5a1377ff160182001232a91d" target="_blank">https://runkit.com/alafr/5a1377ff160182001232a91d</a>

## Supported
 - shapes: rect, circle, path, ellipse, line, polyline, polygon
 - special elements: use, nested svg
 - text elements: text, tspan, textPath
 - text attributes: x, y, dx, dy, rotate, text-anchor, textLength, word-spacing, letter-spacing, font-size
 - styling: presentation attributes, inline `style`, CSS style rules (with correct precedence)
 - colors: fill, stroke & color (rgb, rgba, hex, string, hsl, hsla, cmyk), fill-opacity, stroke-opacity & opacity
 - units: all standard units
 - transformations: transform (matrix, translate, rotate, scale, skew, translate3d when planar), transform-origin, viewBox & preserveAspectRatio attributes
 - clip paths & masks (luminance & alpha masks via mask-type)
 - images
 - fonts (with weight-aware fontCallback)
 - gradients
 - patterns
 - links
 - markers (including orient="auto" and "auto-start-reverse")
 - mix-blend-mode on groups
 - spot colors

## Unsupported
 - filters
 - text attributes: font-variant, writing-mode, unicode-bidi
 - foreignObject (<a href="https://github.com/alafr/SVG-to-PDFKit/issues/37">#37</a>)
 - true 3D transforms (translate3d/rotate3d only supported when planar)
 - other things I don't even know they exist

## Warning
 - Use an updated PDFKit version (≥0.8.1): see <a href="https://github.com/alafr/pdfkit/wiki/How-to-install-and-build-a-PDFKit-branch">here</a> how to build it, or use the prebuilt file in the <a href="https://github.com/alafr/SVG-to-PDFKit/tree/master/examples">examples</a> folder.
 - There are bugs, please send issues and/or pull requests.

## License
&nbsp; &nbsp; <a href="http://choosealicense.com/licenses/mit/">MIT</a>

## Acknowledgments
This fork builds directly on the original [SVG-to-PDFKit](https://github.com/alafr/SVG-to-PDFKit)
by **alafr** (Alain Frappier), to whom the core of this library belongs, and on
the valuable contributions merged from the community. We would like to thank and
credit:

**Original author**
- Alain Frappier (alafr) — original SVG-to-PDFKit

**Authors of merged pull requests & their forks**
- petrkotek — `hsl()`/`hsla()` color parsing (incl. `deg` & decimal fixes), `<marker orient="auto-start-reverse">`
- eriese — CSS style-resolution precedence fix, classList handling
- mewtlu — passing font-weight to `fontCallback`
- thevarium — nested DOCTYPE support
- stocksr — `translate3d` support
- adamwong246 — `transform-origin`
- ziaenezhad — spot-color groundwork
- Kittl (HeritageType) — `mix-blend-mode` on groups, image-open error forwarding
- leduard — `mask-type` (alpha/luminance), element-stack fontCallback
- rpilker — `pointsPerInch`, font variants
- fiberjungle — spot-color string/group robustness fixes
- noteflight — 0-width glyph support
- creately — fontCallback faux-style returns
- helio3197 — font-weight variants
- jacobbubu — richer font/color callbacks (adapted)
- boldx / ChromaPDX — transform-origin improvements
- alvarcarto — spot-color support (the basis for this fork's spot/CMYK color handling)

Thank you all for making this possible.

## Other useful projects
 - <a href="https://github.com/devongovett/pdfkit">PDFKit</a>, the JavaScript PDF generation library for Node and the browser.
 - For inserting SVG graphics into a PDFKit document there is also <a href="https://github.com/devongovett/svgkit">svgkit</a>.
 - For the opposite conversion, from PDF to SVG, you can use <a href="https://github.com/mozilla/pdf.js">Mozilla's PDF.js</a>.
