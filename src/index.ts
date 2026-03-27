import { buildScene } from './core/scene'
import { renderSVG } from './renderers/svg'
import { renderCanvas } from './renderers/canvas'
import { renderPNG } from './renderers/png'
import type { DotQROptions, DotQRScene, Circle, FinderShape, LogoPlacement } from './types'

/**
 * Generate a QR code as an SVG string.
 *
 * @param options - Configuration options for the QR code
 * @returns SVG markup as a string
 */
export function toSVG(options: DotQROptions): string {
  const scene = buildScene(options)
  return renderSVG(scene)
}

/**
 * Render a QR code onto an existing Canvas 2D context.
 *
 * @param options - Configuration options for the QR code
 * @param ctx - The 2D rendering context to draw onto
 * @param logoImage - Optional pre-loaded image element to draw as the logo
 */
export function toCanvas(
  options: DotQROptions,
  ctx: CanvasRenderingContext2D,
  logoImage?: HTMLImageElement | ImageBitmap | null
): void {
  const scene = buildScene(options)
  renderCanvas(scene, ctx, logoImage)
}

/**
 * Generate a QR code as a PNG Blob.
 *
 * @param options - Configuration options for the QR code
 * @param logoImage - Optional pre-loaded image element to draw as the logo
 * @returns A Promise that resolves to a PNG Blob
 */
export async function toPNG(
  options: DotQROptions,
  logoImage?: HTMLImageElement | ImageBitmap | null
): Promise<Blob> {
  const scene = buildScene(options)
  return renderPNG(scene, logoImage)
}

/**
 * Build an intermediate render scene from options (escape hatch for advanced usage).
 * Most users should use toSVG, toCanvas, or toPNG instead.
 *
 * @param options - Configuration options for the QR code
 * @returns A DotQRScene describing all elements to render
 */
export { buildScene }

// Type exports for user-facing API
export type { DotQROptions, DotQRScene, Circle, FinderShape, LogoPlacement }
