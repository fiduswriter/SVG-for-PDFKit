import type PDFDocument from "pdfkit"
/**
 * Insert SVG into a PDF document created with PDFKit.
 *
 * @param doc the PDF document created with PDFKit
 * @param svg the SVG object or XML code
 * @param x the x position where the SVG will be added
 * @param y the y position where the SVG will be added
 * @param options See {@link SVGtoPDF.Options}
 */
declare function SVGtoPDF(
    doc: typeof PDFDocument,
    svg: SVGElement | string,
    x: number,
    y: number,
    options: SVGtoPDF.Options,
): void
declare namespace SVGtoPDF {
    export type Color = [[number, number, number], number] | [string, number] | [string]
    export interface Options {
        // initial viewport width, by default it's the page width
        width?: number

        // initial viewport width, by default it's the page height
        height?: number

        // override alignment of the SVG content inside its viewport
        preserveAspectRatio?: string

        // use the CSS styles computed by the browser (for SVGElement only)
        useCSS?: boolean

        // function called to get the fonts, see source code.
        // Returns the font name/link (string) or an object with the resolved
        // font plus faux style flags.
        fontCallback?: (
            family: string,
            weight: string,
            italic: boolean,
            fontOptions: { fauxItalic: boolean; fauxBold: boolean },
            elementStack?: SVGElement[],
        ) => string | { fontNameorLink: string; fauxBold: boolean; fauxItalic: boolean } | Buffer

        // same as above for the images (for Node.js)
        imageCallback?: (link: string) => string

        // same as above for the external SVG documents
        documentCallback?: (
            file: string,
        ) => SVGElement | string | (SVGElement | string)[]

        // function called to get color, making mapping to CMYK possible
        colorCallback?: (color: Color) => Color

        // function called when there is a warning
        warningCallback?: (warning: string, error?: Error) => void

        // assume that units are PDF points instead of SVG pixels
        assumePt?: boolean

        // points per inch used in the px→pt conversion (default = 72)
        pointsPerInch?: number

        // precision factor for approximate calculations (default = 3)
        precision?: number

        // whether to convert predefined colors like named colors to CMYK, default is false (RGB)
        cmyk?: boolean
    }
}
export = SVGtoPDF
