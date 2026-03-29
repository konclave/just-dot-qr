# just-dot-qr

[![npm](https://img.shields.io/npm/v/just-dot-qr)](https://www.npmjs.com/package/just-dot-qr)
[![license](https://img.shields.io/npm/l/just-dot-qr)](LICENSE)

QR code generator where modules are rendered as circles instead of squares. Outputs SVG, Canvas, or PNG. Includes an optional centered logo with automatic dot cutout, and a React component.

<img src="https://raw.githubusercontent.com/konclave/just-dot-qr/main/assets/example.svg" width="200" alt="Example circular QR code" />

## Features

- Circle-based dots (not squares)
- SVG string, Canvas 2D, and PNG Blob output
- Optional centered logo with configurable dot cutout and padding
- 3 finder pattern styles: `squares`, `rounded`, `circles`
- Customizable dot color, scale, and background (including transparent)
- Full TypeScript support
- React component via `just-dot-qr/react`

## Install

```bash
npm install just-dot-qr
```

React is a peer dependency and only needed if you use the React component:

```bash
npm install just-dot-qr react react-dom
```

## Quick start

```ts
import { toSVG } from 'just-dot-qr'

const svg = toSVG({ text: 'https://example.com' })
document.body.innerHTML = svg
```

## API

### `toSVG(options): string`

Returns the QR code as an SVG string.

```ts
import { toSVG } from 'just-dot-qr'

const svg = toSVG({
  text: 'https://example.com',
  size: 400,
  dotColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  finderStyle: 'rounded',
})
```

### `toCanvas(options, ctx, logoImage?): void`

Renders the QR code onto an existing `CanvasRenderingContext2D`.

```ts
import { toCanvas } from 'just-dot-qr'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

toCanvas({ text: 'https://example.com', size: 400 }, ctx)
```

To render a logo, pass a pre-loaded `HTMLImageElement` or `ImageBitmap` as the third argument:

```ts
const logoImg = new Image()
logoImg.onload = () => {
  toCanvas(
    { text: 'https://example.com', logo: { src: '/logo.png', width: 80, height: 80 } },
    ctx,
    logoImg
  )
}
logoImg.src = '/logo.png'
```

### `toPNG(options, logoImage?): Promise<Blob>`

Returns the QR code as a PNG `Blob`.

```ts
import { toPNG } from 'just-dot-qr'

const blob = await toPNG({ text: 'https://example.com', size: 800 })
const url = URL.createObjectURL(blob)
```

### `buildScene(options): JustDotQRScene`

Advanced escape hatch. Returns the intermediate render model (dots, finders, logo placement) without rendering. Useful for building custom renderers.

```ts
import { buildScene } from 'just-dot-qr'

const scene = buildScene({ text: 'https://example.com' })
// scene.dots — array of Circle objects
// scene.finders — array of FinderShape objects
// scene.logo — optional LogoPlacement
```

### `<JustDotQR>` React component

Import from `just-dot-qr/react`. Accepts all `JustDotQROptions` props plus standard `SVGProps` (e.g. `className`, `style`, `onClick`).

```tsx
import { JustDotQR } from 'just-dot-qr/react'

function App() {
  return (
    <JustDotQR
      text="https://example.com"
      size={300}
      dotColor="#1a1a1a"
      finderStyle="rounded"
      className="my-qr"
    />
  )
}
```

With a logo:

```tsx
<JustDotQR
  text="https://example.com"
  logo={{ src: '/logo.png', width: 60, height: 60, padding: 4 }}
/>
```

## Options

All options are part of `JustDotQROptions`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | `string` | required | The string to encode |
| `size` | `number` | `400` | QR code width and height in pixels |
| `dotColor` | `string` | `'#ffffff'` | Color of the circular dots |
| `backgroundColor` | `string` | `'transparent'` | Background color. Accepts any CSS color or `'transparent'` |
| `dotScale` | `number` | `0.6` | Dot size relative to its grid cell (0–1) |
| `finderStyle` | `'squares' \| 'rounded' \| 'circles'` | `'circles'`* | Visual style of the three finder patterns |
| `errorCorrectionLevel` | `'L' \| 'M' \| 'Q' \| 'H'` | `'H'` | QR error correction level. Use `'H'` when a logo is present |
| `logo.src` | `string` | — | URL or data URI of the logo image |
| `logo.width` | `number` | — | Width of the logo in pixels. When omitted, no dot cutout is applied |
| `logo.height` | `number` | `logo.width` | Height of the logo in pixels |
| `logo.padding` | `number` | `0` | Extra pixels of dot-free space around the logo on each side |

> *The React component defaults `finderStyle` to `'rounded'`.

## License

MIT — see [LICENSE](LICENSE).
