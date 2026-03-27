import type { DotQRScene, FinderShape } from '../types'

/**
 * Round a number to 2 decimal places for SVG output.
 */
function n(x: number): number {
  return Math.round(x * 100) / 100
}

/**
 * Render a finder pattern shape as SVG markup.
 */
function renderFinder(finder: FinderShape): string {
  const { x, y, cellSize, style, color } = finder
  const cx = n(x + 3.5 * cellSize)
  const cy = n(y + 3.5 * cellSize)

  if (style === 'squares') {
    return (
      `<rect x="${n(x)}" y="${n(y)}" width="${n(7 * cellSize)}" height="${n(7 * cellSize)}" fill="none" stroke="${color}" stroke-width="${n(cellSize)}"/>` +
      `<rect x="${n(x + 2 * cellSize)}" y="${n(y + 2 * cellSize)}" width="${n(3 * cellSize)}" height="${n(3 * cellSize)}" fill="${color}"/>`
    )
  }

  if (style === 'rounded') {
    return (
      `<rect x="${n(x)}" y="${n(y)}" width="${n(7 * cellSize)}" height="${n(7 * cellSize)}" rx="${n(1.5 * cellSize)}" fill="none" stroke="${color}" stroke-width="${n(cellSize)}"/>` +
      `<rect x="${n(x + 2 * cellSize)}" y="${n(y + 2 * cellSize)}" width="${n(3 * cellSize)}" height="${n(3 * cellSize)}" rx="${n(0.75 * cellSize)}" fill="${color}"/>`
    )
  }

  // style === 'circles'
  return (
    `<circle cx="${cx}" cy="${cy}" r="${n(3.5 * cellSize)}" fill="none" stroke="${color}" stroke-width="${n(cellSize)}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${n(1.5 * cellSize)}" fill="${color}"/>`
  )
}

/**
 * Converts a DotQRScene to an SVG string.
 */
export function renderSVG(scene: DotQRScene): string {
  const { dots, finders, size, backgroundColor, logo } = scene

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`)

  // Background
  if (backgroundColor !== 'transparent') {
    parts.push(`<rect width="100%" height="100%" fill="${backgroundColor}"/>`)
  }

  // Data dots
  for (const dot of dots) {
    parts.push(`<circle cx="${n(dot.cx)}" cy="${n(dot.cy)}" r="${n(dot.r)}" fill="${dot.color}"/>`)
  }

  // Finder patterns
  for (const finder of finders) {
    parts.push(renderFinder(finder))
  }

  // Logo
  if (logo) {
    if (logo.width === 0 || logo.height === 0) {
      parts.push(`<image href="${logo.src}" x="${n(logo.x)}" y="${n(logo.y)}"/>`)
    } else {
      parts.push(`<image href="${logo.src}" x="${n(logo.x)}" y="${n(logo.y)}" width="${n(logo.width)}" height="${n(logo.height)}"/>`)
    }
  }

  parts.push('</svg>')

  return parts.join('')
}
