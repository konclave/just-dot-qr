/**
 * Core TypeScript interfaces for the dot-qr library
 */

/**
 * User-facing configuration options for QR code generation
 */
export interface DotQROptions {
  /** QR code content/text to encode */
  text: string;

  /** Size of the QR code in pixels (default: 400) */
  size?: number;

  /** Color of the QR code dots (default: '#ffffff') */
  dotColor?: string;

  /** Background color (default: 'transparent') */
  backgroundColor?: string;

  /** Scale of dots relative to their grid cell, 0–1 (default: 0.6) */
  dotScale?: number;

  /** Style of the finder patterns (default: 'circles') */
  finderStyle?: 'squares' | 'rounded' | 'circles';

  /** Logo overlay configuration */
  logo?: {
    /** URL or data URI of the logo image */
    src: string;

    /** Width of the logo in pixels. When omitted, no dot cutout is applied around the logo (the logo overlays the QR code). */
    width?: number;

    /** Height of the logo in pixels. When omitted, defaults to width. When both are omitted, no dot cutout is applied. */
    height?: number;

    /** Extra space in pixels to clear of dots around the logo on each side (default: 0) */
    padding?: number;
  };

  /** Error correction level (default: 'H', required when logo is present) */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Represents a circular dot in the QR code matrix
 */
export interface Circle {
  /** Center X coordinate */
  cx: number;

  /** Center Y coordinate */
  cy: number;

  /** Radius in pixels */
  r: number;

  /** Fill color */
  color: string;
}

/**
 * Represents a finder pattern shape
 */
export interface FinderShape {
  /** Top-left X coordinate of the 7×7 finder region */
  x: number;

  /** Top-left Y coordinate of the 7×7 finder region */
  y: number;

  /** Size of each cell in pixels */
  cellSize: number;

  /** Visual style of the finder */
  style: 'squares' | 'rounded' | 'circles';

  /** Fill color */
  color: string;
}

/**
 * Represents a logo overlay placement
 */
export interface LogoPlacement {
  /** Top-left X coordinate of the cutout rectangle */
  x: number;

  /** Top-left Y coordinate of the cutout rectangle */
  y: number;

  /** Width of the cutout in pixels */
  width: number;

  /** Height of the cutout in pixels */
  height: number;

  /** URL or data URI of the logo image */
  src: string;
}

/**
 * Intermediate "render model" describing what needs to be drawn
 * Pure data structure passed to renderers (SVG/Canvas/PNG)
 */
export interface DotQRScene {
  /** Array of circular dots to render */
  dots: Circle[];

  /** Array of finder patterns to render */
  finders: FinderShape[];

  /** Total size of the QR code in pixels */
  size: number;

  /** Background color */
  backgroundColor: string;

  /** Optional logo overlay configuration */
  logo?: LogoPlacement;
}
