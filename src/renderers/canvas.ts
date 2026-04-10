import 'canvas-roundrect-polyfill';
import type { JustDotQRScene } from '../types';

/**
 * Renders a JustDotQRScene to an existing CanvasRenderingContext2D.
 *
 * @param scene - The scene describing what to draw
 * @param ctx - The 2D rendering context to draw onto
 * @param logoImage - Optional pre-loaded image element to draw as the logo
 */
export function renderCanvas(
  scene: JustDotQRScene,
  ctx: CanvasRenderingContext2D,
  logoImage?: HTMLImageElement | ImageBitmap | null,
): void {
  ctx.save();

  // Background
  if (scene.backgroundColor !== 'transparent') {
    ctx.fillStyle = scene.backgroundColor;
    ctx.fillRect(0, 0, scene.size, scene.size);
  }

  // Data dots
  for (const dot of scene.dots) {
    ctx.fillStyle = dot.color;
    ctx.beginPath();
    ctx.arc(dot.cx, dot.cy, dot.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Finder patterns
  for (const finder of scene.finders) {
    const { x, y, cellSize, style, color } = finder;
    const inset = cellSize / 2;

    if (style === 'squares') {
      // Outer ring: stroke a rect
      ctx.strokeStyle = color;
      ctx.lineWidth = cellSize;
      ctx.strokeRect(x + inset, y + inset, 6 * cellSize, 6 * cellSize);
      // Inner filled rect (3x3 modules, offset 2 cells from top-left)
      ctx.fillStyle = color;
      ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    } else if (style === 'rounded') {
      // Outer ring: rounded rect stroke
      // Note: ctx.roundRect requires Chrome 99+, Firefox 112+, or a polyfill
      ctx.strokeStyle = color;
      ctx.lineWidth = cellSize;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, 6 * cellSize, 6 * cellSize, 1.5 * cellSize);
      ctx.stroke();
      // Inner filled rounded rect
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(
        x + 2 * cellSize,
        y + 2 * cellSize,
        3 * cellSize,
        3 * cellSize,
        0.75 * cellSize,
      );
      ctx.fill();
    } else {
      // style === 'circles'
      const cx = x + 3.5 * cellSize;
      const cy = y + 3.5 * cellSize;
      // Outer ring
      ctx.strokeStyle = color;
      ctx.lineWidth = cellSize;
      ctx.beginPath();
      ctx.arc(cx, cy, 3 * cellSize, 0, Math.PI * 2);
      ctx.stroke();
      // Inner filled circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.5 * cellSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Logo
  if (scene.logo && logoImage) {
    if (scene.logo.width > 0 && scene.logo.height > 0) {
      ctx.drawImage(logoImage, scene.logo.x, scene.logo.y, scene.logo.width, scene.logo.height);
    } else {
      ctx.drawImage(logoImage, scene.logo.x, scene.logo.y);
    }
  }

  ctx.restore();
}
