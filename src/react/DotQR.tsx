import React from 'react'
import { buildScene } from '../core/scene'
import { DotQROptions, FinderShape } from '../types'

export type DotQRProps = DotQROptions & Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height' | 'viewBox'>

export function DotQR(props: DotQRProps): React.ReactElement {
  const {
    text, size = 400, dotColor = '#ffffff', backgroundColor = 'transparent',
    dotScale = 0.6, finderStyle = 'circles', logo, errorCorrectionLevel = 'H',
    ...svgProps
  } = props

  const scene = buildScene({ text, size, dotColor, backgroundColor, dotScale, finderStyle, logo, errorCorrectionLevel })

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={scene.size}
      height={scene.size}
      viewBox={`0 0 ${scene.size} ${scene.size}`}
      {...svgProps}
    >
      {/* Background */}
      {scene.backgroundColor !== 'transparent' && (
        <rect width="100%" height="100%" fill={scene.backgroundColor} />
      )}

      {/* Data dots */}
      {scene.dots.map((dot, i) => (
        <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.color} />
      ))}

      {/* Finder patterns */}
      {scene.finders.map((finder, i) => renderFinder(finder, i))}

      {/* Logo */}
      {scene.logo && (
        <image
          href={scene.logo.src}
          x={scene.logo.x}
          y={scene.logo.y}
          {...(scene.logo.width > 0 && scene.logo.height > 0
            ? { width: scene.logo.width, height: scene.logo.height }
            : {})}
        />
      )}
    </svg>
  )
}

function n(x: number): number {
  return Math.round(x * 100) / 100
}

function renderFinder(finder: FinderShape, key: number): React.ReactElement {
  const { x, y, cellSize, style, color } = finder
  const cx = n(x + 3.5 * cellSize)
  const cy = n(y + 3.5 * cellSize)

  if (style === 'squares') {
    return (
      <g key={key}>
        <rect
          x={n(x)}
          y={n(y)}
          width={n(7 * cellSize)}
          height={n(7 * cellSize)}
          fill="none"
          stroke={color}
          strokeWidth={n(cellSize)}
        />
        <rect
          x={n(x + 2 * cellSize)}
          y={n(y + 2 * cellSize)}
          width={n(3 * cellSize)}
          height={n(3 * cellSize)}
          fill={color}
        />
      </g>
    )
  }

  if (style === 'rounded') {
    return (
      <g key={key}>
        <rect
          x={n(x)}
          y={n(y)}
          width={n(7 * cellSize)}
          height={n(7 * cellSize)}
          rx={n(1.5 * cellSize)}
          fill="none"
          stroke={color}
          strokeWidth={n(cellSize)}
        />
        <rect
          x={n(x + 2 * cellSize)}
          y={n(y + 2 * cellSize)}
          width={n(3 * cellSize)}
          height={n(3 * cellSize)}
          rx={n(0.75 * cellSize)}
          fill={color}
        />
      </g>
    )
  }

  // style === 'circles'
  return (
    <g key={key}>
      <circle
        cx={cx}
        cy={cy}
        r={n(3.5 * cellSize)}
        fill="none"
        stroke={color}
        strokeWidth={n(cellSize)}
      />
      <circle
        cx={cx}
        cy={cy}
        r={n(1.5 * cellSize)}
        fill={color}
      />
    </g>
  )
}
