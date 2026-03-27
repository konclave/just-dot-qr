import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DotQR } from '../src/react/DotQR'
import React from 'react'

describe('DotQR React component', () => {
  it('renders an SVG string', () => {
    const html = renderToStaticMarkup(React.createElement(DotQR, { text: 'hello' }))
    expect(html).toContain('<svg')
    expect(html).toContain('<circle')
  })

  it('passes extra props to svg', () => {
    const html = renderToStaticMarkup(React.createElement(DotQR, { text: 'hello', className: 'qr-code' }))
    expect(html).toContain('class="qr-code"')
  })
})
