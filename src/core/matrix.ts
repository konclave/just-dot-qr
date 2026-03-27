/**
 * Matrix layer - wraps the qrcode npm package to extract the QR boolean matrix
 */

import QRCode from 'qrcode'

/**
 * Generates a boolean matrix representation of a QR code.
 *
 * @param text - The text to encode in the QR code
 * @param ecLevel - The error correction level: 'L', 'M', 'Q', or 'H'
 * @returns A 2D boolean array where true = dark module, false = light module
 */
export function generateMatrix(
  text: string,
  ecLevel: 'L' | 'M' | 'Q' | 'H'
): boolean[][] {
  // Create QR code using the qrcode package
  const qr = QRCode.create(text, { errorCorrectionLevel: ecLevel })

  const size = qr.modules.size
  const data = qr.modules.data

  // Convert the Uint8Array to a 2D boolean array
  // data[row * size + col] !== 0 means dark module (true)
  const matrix: boolean[][] = []

  for (let row = 0; row < size; row++) {
    const rowData: boolean[] = []
    for (let col = 0; col < size; col++) {
      const index = row * size + col
      rowData.push(data[index] !== 0)
    }
    matrix.push(rowData)
  }

  return matrix
}
