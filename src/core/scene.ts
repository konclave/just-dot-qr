import type { DotQROptions, DotQRScene, Circle, LogoPlacement } from '../types'
import { generateMatrix } from './matrix'
import { getFinderShapes } from './finder'

/**
 * Builds a DotQRScene from user-facing options.
 * This is pure computation — no DOM or browser APIs are used.
 *
 * @param options - Configuration options for the QR code
 * @returns A DotQRScene describing all elements to render
 */
export function buildScene(options: DotQROptions): DotQRScene {
  // Step 1: Generate the QR matrix
  const matrix = generateMatrix(options.text, options.errorCorrectionLevel ?? 'H')
  const matrixSize = matrix.length

  // Step 2: Compute cell size
  const size = options.size ?? 400
  const cellSize = size / matrixSize

  // Step 3: Get finder shapes
  const finders = getFinderShapes(
    matrixSize,
    cellSize,
    options.finderStyle ?? 'circles',
    options.dotColor ?? '#ffffff'
  )

  // Step 4: Compute logo placement if a logo is provided
  let logoPlacement: LogoPlacement | undefined
  if (options.logo) {
    const logoWidth = options.logo.width ?? 0
    const logoHeight = options.logo.height ?? 0
    logoPlacement = {
      src: options.logo.src,
      width: logoWidth,
      height: logoHeight,
      x: size / 2 - logoWidth / 2,
      y: size / 2 - logoHeight / 2,
    }
  }

  // Step 5: Iterate over matrix and collect dots
  const dots: Circle[] = []
  const dotColor = options.dotColor ?? '#ffffff'
  const dotScale = options.dotScale ?? 0.6
  const r = (cellSize / 2) * dotScale

  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      // Only process dark modules
      if (!matrix[row][col]) continue

      // Skip finder pattern regions (7×7) plus their 1-cell separator zones (8×8 total)
      // Top-left finder: col 0–7, row 0–7
      if (col <= 7 && row <= 7) continue
      // Top-right finder: col (matrixSize-8) to (matrixSize-1), row 0–7
      if (col >= matrixSize - 8 && row <= 7) continue
      // Bottom-left finder: col 0–7, row (matrixSize-8) to (matrixSize-1)
      if (col <= 7 && row >= matrixSize - 8) continue

      // Compute cell center
      const cx = (col + 0.5) * cellSize
      const cy = (row + 0.5) * cellSize

      // Skip if cell center falls within logo cutout (only when dimensions are known)
      if (
        logoPlacement &&
        logoPlacement.width > 0 &&
        logoPlacement.height > 0
      ) {
        if (
          cx >= logoPlacement.x &&
          cx <= logoPlacement.x + logoPlacement.width &&
          cy >= logoPlacement.y &&
          cy <= logoPlacement.y + logoPlacement.height
        ) {
          continue
        }
      }

      dots.push({ cx, cy, r, color: dotColor })
    }
  }

  // Step 6: Return the scene
  return {
    dots,
    finders,
    size,
    backgroundColor: options.backgroundColor ?? 'transparent',
    logo: logoPlacement,
  }
}
