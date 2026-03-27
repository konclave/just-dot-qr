import { describe, it, expect } from 'vitest'
import { generateMatrix } from '../src/core/matrix'

describe('generateMatrix', () => {
  it('returns a square 2D array', () => {
    const matrix = generateMatrix('https://example.com', 'H')

    // Check that it's a 2D array
    expect(Array.isArray(matrix)).toBe(true)
    expect(matrix.length > 0).toBe(true)

    // Check that each row is an array
    for (const row of matrix) {
      expect(Array.isArray(row)).toBe(true)
    }

    // Check that it's square (rows × cols are equal)
    const rows = matrix.length
    const cols = matrix[0].length
    expect(rows).toBe(cols)
    expect(rows).toBeGreaterThan(0)
  })

  it('contains only boolean values', () => {
    const matrix = generateMatrix('https://example.com', 'H')

    for (const row of matrix) {
      for (const cell of row) {
        expect(typeof cell).toBe('boolean')
        expect(cell === true || cell === false).toBe(true)
      }
    }
  })

  it('may differ in size based on error correction level', () => {
    const matrixL = generateMatrix('A', 'L')
    const matrixH = generateMatrix('A', 'H')

    // Get sizes
    const sizeL = matrixL.length
    const sizeH = matrixH.length

    // With different error correction levels, the QR code versions may differ
    // Higher error correction typically requires more modules
    // Note: For very short text, they might be the same size, but H should be >= L
    expect(sizeH).toBeGreaterThanOrEqual(sizeL)
  })

  it('generates consistent matrices for the same input', () => {
    const matrix1 = generateMatrix('test', 'M')
    const matrix2 = generateMatrix('test', 'M')

    expect(matrix1.length).toBe(matrix2.length)
    expect(matrix1[0].length).toBe(matrix2[0].length)

    // Check that they're identical
    for (let i = 0; i < matrix1.length; i++) {
      for (let j = 0; j < matrix1[i].length; j++) {
        expect(matrix1[i][j]).toBe(matrix2[i][j])
      }
    }
  })

  it('handles different error correction levels', () => {
    const levels: ('L' | 'M' | 'Q' | 'H')[] = ['L', 'M', 'Q', 'H']

    for (const level of levels) {
      const matrix = generateMatrix('test data', level)
      expect(Array.isArray(matrix)).toBe(true)
      expect(matrix.length > 0).toBe(true)
      expect(matrix[0].length).toBe(matrix.length)
    }
  })
})
