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
})
