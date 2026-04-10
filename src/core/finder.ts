import type { FinderShape } from '../types';

/**
 * Returns an array of exactly 3 FinderShape objects representing the QR code
 * finder patterns at the top-left, top-right, and bottom-left corners.
 *
 * @param matrixSize - Number of modules in the QR code matrix (e.g. 21 for version 1)
 * @param cellSize - Size of each cell/module in pixels
 * @param style - Visual style of the finder pattern
 * @param color - Fill color of the finder pattern
 */
export function getFinderShapes(
  matrixSize: number,
  cellSize: number,
  style: 'squares' | 'rounded' | 'circles',
  color: string,
): FinderShape[] {
  return [
    // Top-left: module (0,0) to (6,6)
    {
      x: 0,
      y: 0,
      cellSize,
      style,
      color,
    },
    // Top-right: module (matrixSize-7, 0) to (matrixSize-1, 6)
    {
      x: (matrixSize - 7) * cellSize,
      y: 0,
      cellSize,
      style,
      color,
    },
    // Bottom-left: module (0, matrixSize-7) to (6, matrixSize-1)
    {
      x: 0,
      y: (matrixSize - 7) * cellSize,
      cellSize,
      style,
      color,
    },
  ];
}
