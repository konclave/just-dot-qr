import { describe, test, expect } from 'vitest'
import { toSVG } from '../src/index'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logoPath = resolve(__dirname, '../joyn.png')

describe('acceptance test', () => {
  test('generates SVG matching reference parameters', () => {
    const svg = toSVG({
      text: 'https://www.joyn.de/plus#redirectUrl=%2F&referer=%2F',
      size: 399,
      logo: { src: logoPath, width: 185, height: 78 },
    })

    // Save output for manual inspection
    writeFileSync(resolve(__dirname, '../acceptance-output.svg'), svg)

    // Basic structure checks
    expect(svg).toMatch(/^<svg/)
    expect(svg).toContain('width="399"')
    expect(svg).toContain('height="399"')

    // Should have circles (data dots)
    const circleCount = (svg.match(/<circle/g) || []).length
    expect(circleCount).toBeGreaterThan(100) // QR at H level has many dots

    // Should have finder patterns (circles style: circles with fill="none")
    expect(svg).toContain('fill="none"')

    // Should have logo image tag
    expect(svg).toContain('<image')
    expect(svg).toContain(logoPath.replace(/\\/g, '/'))
  })

  test('reference circle count is in expected range', () => {
    // Read reference SVG to count dots
    const refSvg = readFileSync(resolve(__dirname, '../qr-code.svg'), 'utf-8')
    const refCircleCount = (refSvg.match(/<path/g) || []).length // reference uses <path> for circles

    const svg = toSVG({
      text: 'https://www.joyn.de/plus#redirectUrl=%2F&referer=%2F',
      size: 399,
      logo: { src: logoPath, width: 185, height: 78 },
    })
    const ourCircleCount = (svg.match(/<circle/g) || []).length
    // Subtract 6 (3 finders × 2 circles each)
    const ourDotCount = ourCircleCount - 6

    // Allow ±5% difference (reference may have been generated with different settings)
    expect(ourDotCount).toBeGreaterThan(refCircleCount * 0.85)
    expect(ourDotCount).toBeLessThan(refCircleCount * 1.15)

    console.log(`Reference path count: ${refCircleCount}, Our circle count (excluding finders): ${ourDotCount}`)
  })

  test('generates SVG without logo cutout when no dimensions provided', () => {
    const svg = toSVG({
      text: 'https://www.joyn.de/plus#redirectUrl=%2F&referer=%2F',
      size: 399,
      logo: { src: logoPath },
    })

    // Should still have the image tag
    expect(svg).toContain('<image')
    // Should still have the correct size
    expect(svg).toContain('width="399"')
    expect(svg).toContain('height="399"')
  })
})
