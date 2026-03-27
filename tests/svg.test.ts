import { describe, it, expect } from 'vitest'
import { buildScene } from '../src/core/scene'
import { renderSVG } from '../src/renderers/svg'

describe('renderSVG', () => {
  it('output is a valid string starting with <svg', () => {
    const scene = buildScene({ text: 'Hello' })
    const svg = renderSVG(scene)

    expect(typeof svg).toBe('string')
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.endsWith('</svg>')).toBe(true)
  })

  it('contains correct number of <circle elements for dots with circles finder style', () => {
    const scene = buildScene({ text: 'Hello', finderStyle: 'circles' })
    const svg = renderSVG(scene)

    // Each finder contributes 2 circles (outer ring + inner fill), 3 finders total = 6 finder circles
    const finderCircleCount = scene.finders.length * 2
    const expectedCircleCount = scene.dots.length + finderCircleCount

    const matches = svg.match(/<circle/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBe(expectedCircleCount)
  })

  it('contains correct number of <rect elements for dots with squares finder style', () => {
    const scene = buildScene({ text: 'Hello', finderStyle: 'squares' })
    const svg = renderSVG(scene)

    // Each finder contributes 2 rects (outer ring + inner fill), 3 finders total = 6 finder rects
    // Plus 1 background rect if backgroundColor is not transparent (default is transparent, so no background rect)
    const finderRectCount = scene.finders.length * 2
    const matches = svg.match(/<rect/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBe(finderRectCount)
  })

  it('background rect is present when backgroundColor is set', () => {
    const scene = buildScene({ text: 'Hello', backgroundColor: '#000000' })
    const svg = renderSVG(scene)

    expect(svg).toContain('<rect width="100%" height="100%" fill="#000000"/>')
  })

  it('background rect is absent when backgroundColor is transparent', () => {
    const scene = buildScene({ text: 'Hello', backgroundColor: 'transparent' })
    const svg = renderSVG(scene)

    expect(svg).not.toContain('width="100%" height="100%"')
  })

  it('background rect is absent by default (default is transparent)', () => {
    const scene = buildScene({ text: 'Hello' })
    const svg = renderSVG(scene)

    expect(svg).not.toContain('width="100%" height="100%"')
  })

  it('logo <image> tag is present when logo is in scene', () => {
    const scene = buildScene({
      text: 'Hello',
      logo: { src: 'https://example.com/logo.png', width: 60, height: 40 },
    })
    const svg = renderSVG(scene)

    expect(svg).toContain('<image href="https://example.com/logo.png"')
    expect(svg).toContain('width="60"')
    expect(svg).toContain('height="40"')
  })

  it('logo <image> tag omits width/height when logo.width === 0', () => {
    const scene = buildScene({
      text: 'Hello',
      logo: { src: 'logo.png' },
    })
    const svg = renderSVG(scene)

    expect(svg).toContain('<image href="logo.png"')
    // Should not contain width/height attributes on the image tag
    const imageTagMatch = svg.match(/<image[^>]*>/)
    expect(imageTagMatch).not.toBeNull()
    expect(imageTagMatch![0]).not.toContain('width=')
    expect(imageTagMatch![0]).not.toContain('height=')
  })

  it('with finderStyle=circles, finders render as <circle> elements', () => {
    const scene = buildScene({ text: 'Hello', finderStyle: 'circles' })
    const svg = renderSVG(scene)

    // Each circle-style finder has 2 circles
    const circleMatches = svg.match(/<circle/g)
    expect(circleMatches).not.toBeNull()
    // At minimum, there should be 6 circle elements from finders (3 finders * 2 each)
    expect(circleMatches!.length).toBeGreaterThanOrEqual(6)
  })

  it('with finderStyle=squares, finders render as <rect> elements (not circles)', () => {
    const scene = buildScene({ text: 'Hello', finderStyle: 'squares' })
    const svg = renderSVG(scene)

    const rectMatches = svg.match(/<rect/g)
    expect(rectMatches).not.toBeNull()
    // 3 finders * 2 rects each = 6 rects
    expect(rectMatches!.length).toBe(6)
  })

  it('with finderStyle=rounded, finders render as rounded <rect> elements', () => {
    const scene = buildScene({ text: 'Hello', finderStyle: 'rounded' })
    const svg = renderSVG(scene)

    expect(svg).toContain('rx=')
    const rectMatches = svg.match(/<rect/g)
    expect(rectMatches).not.toBeNull()
    expect(rectMatches!.length).toBe(6)
  })

  it('SVG has correct size attributes', () => {
    const scene = buildScene({ text: 'Hello', size: 300 })
    const svg = renderSVG(scene)

    expect(svg).toContain('width="300"')
    expect(svg).toContain('height="300"')
    expect(svg).toContain('viewBox="0 0 300 300"')
  })

  it('numbers are rounded to 2 decimal places', () => {
    const scene = buildScene({ text: 'Hello' })
    const svg = renderSVG(scene)

    // Check that no number has more than 2 decimal places
    // Match all numeric attribute values like cx="19.05"
    const numericValues = svg.match(/(?:cx|cy|r|x|y|width|height|stroke-width|rx)="([\d.]+)"/g) ?? []
    for (const attr of numericValues) {
      const match = attr.match(/"([\d.]+)"/)
      if (match) {
        const val = match[1]
        const decimalPart = val.split('.')[1]
        if (decimalPart) {
          expect(decimalPart.length).toBeLessThanOrEqual(2)
        }
      }
    }
  })
})
