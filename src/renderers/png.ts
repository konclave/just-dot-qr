import type { JustDotQRScene } from '../types';
import { renderCanvas } from './canvas';

/**
 * Renders a JustDotQRScene to a PNG Blob using an offscreen canvas.
 *
 * Targets browser environments (uses `document.createElement`).
 *
 * @param scene - The scene describing what to draw
 * @param logoImage - Optional pre-loaded image element to draw as the logo
 * @returns A Promise that resolves to a PNG Blob
 */
export async function renderPNG(
  scene: JustDotQRScene,
  logoImage?: HTMLImageElement | ImageBitmap | null,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = scene.size;
  canvas.height = scene.size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }

  renderCanvas(scene, ctx, logoImage);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('canvas.toBlob returned null'));
      }
    }, 'image/png');
  });
}
