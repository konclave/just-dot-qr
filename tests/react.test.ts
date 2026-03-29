import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { JustDotQR } from '../src/react/JustDotQR'
import React from 'react'

describe('JustDotQR React component', () => {
  it('renders an SVG string', () => {
    const html = renderToStaticMarkup(React.createElement(JustDotQR, { text: 'hello' }))
    expect(html).toContain('<svg')
    expect(html).toContain('<circle')
  })

  it('passes extra props to svg', () => {
    const html = renderToStaticMarkup(React.createElement(JustDotQR, { text: 'hello', className: 'qr-code' }))
    expect(html).toContain('class="qr-code"')
  })

  it('reflects size in width, height, and viewBox', () => {
    const html = renderToStaticMarkup(React.createElement(JustDotQR, { text: 'hello', size: 300 }))
    expect(html).toContain('width="300"')
    expect(html).toContain('height="300"')
    expect(html).toContain('viewBox="0 0 300 300"')
  })

  it('renders background rect when backgroundColor is set', () => {
    const html = renderToStaticMarkup(React.createElement(JustDotQR, { text: 'hello', backgroundColor: '#000000' }))
    expect(html).toContain('<rect')
    expect(html).toContain('fill="#000000"')
  })

  it('omits background rect when backgroundColor is transparent', () => {
    const html = renderToStaticMarkup(
      React.createElement(JustDotQR, { text: 'hello', backgroundColor: 'transparent', finderStyle: 'circles' })
    )
    // With circles finder style and transparent bg, there should be no <rect> elements at all
    const rectCount = (html.match(/<rect/g) || []).length
    expect(rectCount).toBe(0)
  })

  it('renders finder patterns as rects for finderStyle squares', () => {
    const html = renderToStaticMarkup(React.createElement(JustDotQR, { text: 'hello', finderStyle: 'squares' }))
    expect(html).toContain('<rect')
  })

  it('renders finder patterns with rx for finderStyle rounded', () => {
    const html = renderToStaticMarkup(React.createElement(JustDotQR, { text: 'hello', finderStyle: 'rounded' }))
    expect(html).toContain('rx="')
  })

  it('renders finder patterns as circles for finderStyle circles', () => {
    const html = renderToStaticMarkup(React.createElement(JustDotQR, { text: 'hello', finderStyle: 'circles' }))
    expect(html).toContain('<circle')
  })

  it('renders image element when logo is provided with dimensions', () => {
    const html = renderToStaticMarkup(
      React.createElement(JustDotQR, {
        text: 'hello',
        logo: { src: 'https://example.com/logo.png', width: 60, height: 60 },
      })
    )
    expect(html).toContain('<image')
    expect(html).toContain('href="https://example.com/logo.png"')
    expect(html).toContain('width="60"')
    expect(html).toContain('height="60"')
  })

  it('applies dotColor to rendered circles', () => {
    const html = renderToStaticMarkup(React.createElement(JustDotQR, { text: 'hello', dotColor: '#ff0000' }))
    expect(html).toContain('fill="#ff0000"')
  })
})
