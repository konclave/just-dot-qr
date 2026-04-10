import { describe, it, expect } from 'vitest';

import { buildScene } from '../src/core/scene';

describe('buildScene', () => {
  it('returns a scene with defaults for basic input', () => {
    const scene = buildScene({ text: 'A' });

    expect(scene.dots).toBeInstanceOf(Array);
    expect(scene.dots.length).toBeGreaterThan(0);
    expect(scene.finders).toHaveLength(3);
    expect(scene.size).toBe(400);
    expect(scene.backgroundColor).toBe('transparent');
    expect(scene.logo).toBeUndefined();
  });

  it('excludes dots whose center falls in the top-left 8×8 cell finder region', () => {
    const scene = buildScene({ text: 'A' });
    // Derive matrixSize from finder positions: top-right finder x = (matrixSize-7)*cellSize
    const topRightFinder = scene.finders[1];
    const cellSize = scene.size / 21; // For version 1 QR code, matrixSize is 21
    const matrixSize = Math.round(topRightFinder.x / cellSize) + 7;
    expect(matrixSize).toBe(21); // Assert version 1 QR code is generated

    // Any dot center in col 0–7, row 0–7 should be excluded
    const dotsInTopLeft = scene.dots.filter((dot) => {
      const col = dot.cx / cellSize - 0.5;
      const row = dot.cy / cellSize - 0.5;
      return col >= 0 && col <= 7 && row >= 0 && row <= 7;
    });

    expect(dotsInTopLeft).toHaveLength(0);
  });

  it('excludes dots whose center falls in the top-right 8×8 cell finder region', () => {
    const scene = buildScene({ text: 'A' });
    // Derive matrixSize from finder positions
    const topRightFinder = scene.finders[1];
    const cellSize = scene.size / 21;
    const matrixSize = Math.round(topRightFinder.x / cellSize) + 7;
    expect(matrixSize).toBe(21); // Assert version 1 QR code is generated

    // Any dot center in col (matrixSize-8) to (matrixSize-1), row 0–7 should be excluded
    const dotsInTopRight = scene.dots.filter((dot) => {
      const col = dot.cx / cellSize - 0.5;
      const row = dot.cy / cellSize - 0.5;
      return col >= matrixSize - 8 && col <= matrixSize - 1 && row >= 0 && row <= 7;
    });

    expect(dotsInTopRight).toHaveLength(0);
  });

  it('excludes dots whose center falls in the bottom-left 8×8 cell finder region', () => {
    const scene = buildScene({ text: 'A' });
    // Derive matrixSize from finder positions
    const topRightFinder = scene.finders[1];
    const cellSize = scene.size / 21;
    const matrixSize = Math.round(topRightFinder.x / cellSize) + 7;
    expect(matrixSize).toBe(21); // Assert version 1 QR code is generated

    // Any dot center in col 0–7, row (matrixSize-8) to (matrixSize-1) should be excluded
    const dotsInBottomLeft = scene.dots.filter((dot) => {
      const col = dot.cx / cellSize - 0.5;
      const row = dot.cy / cellSize - 0.5;
      return col >= 0 && col <= 7 && row >= matrixSize - 8 && row <= matrixSize - 1;
    });

    expect(dotsInBottomLeft).toHaveLength(0);
  });

  it('excludes dots near center when logo with explicit dimensions is provided', () => {
    const logoWidth = 80;
    const logoHeight = 80;
    const size = 400;

    const sceneWithLogo = buildScene({
      text: 'A',
      logo: { src: 'x', width: logoWidth, height: logoHeight },
    });
    const sceneWithoutLogo = buildScene({ text: 'A' });

    // Logo is centered at (200, 200), so cutout is x=160–240, y=160–240
    const logoCutoutLeft = size / 2 - logoWidth / 2;
    const logoCutoutRight = size / 2 + logoWidth / 2;
    const logoCutoutTop = size / 2 - logoHeight / 2;
    const logoCutoutBottom = size / 2 + logoHeight / 2;

    // No dots should be inside the logo cutout region
    const dotsInCutout = sceneWithLogo.dots.filter(
      (dot) =>
        dot.cx >= logoCutoutLeft &&
        dot.cx <= logoCutoutRight &&
        dot.cy >= logoCutoutTop &&
        dot.cy <= logoCutoutBottom,
    );
    expect(dotsInCutout).toHaveLength(0);

    // Scene with logo should have fewer dots than without
    expect(sceneWithLogo.dots.length).toBeLessThan(sceneWithoutLogo.dots.length);
  });

  it('respects custom size option', () => {
    const scene = buildScene({ text: 'A', size: 200 });
    expect(scene.size).toBe(200);
  });

  it('stores logo placement with correct coordinates', () => {
    const scene = buildScene({
      text: 'A',
      logo: { src: 'logo.png', width: 60, height: 40 },
    });

    expect(scene.logo).toBeDefined();
    expect(scene.logo!.src).toBe('logo.png');
    expect(scene.logo!.width).toBe(60);
    expect(scene.logo!.height).toBe(40);
    // Centered at (200, 200)
    expect(scene.logo!.x).toBe(200 - 30); // 170
    expect(scene.logo!.y).toBe(200 - 20); // 180
  });

  it('stores logo placement with zeros when no dimensions provided', () => {
    const scene = buildScene({
      text: 'A',
      logo: { src: 'logo.png' },
    });

    expect(scene.logo).toBeDefined();
    expect(scene.logo!.width).toBe(0);
    expect(scene.logo!.height).toBe(0);
    // x and y are size/2 - 0 = 200
    expect(scene.logo!.x).toBe(200);
    expect(scene.logo!.y).toBe(200);
  });

  it('uses custom dot color and scale', () => {
    const scene = buildScene({ text: 'A', dotColor: '#ff0000', dotScale: 0.8 });
    const matrixSize = 21;
    const cellSize = 400 / matrixSize;
    const expectedR = (cellSize / 2) * 0.8;

    expect(scene.dots[0].color).toBe('#ff0000');
    expect(scene.dots[0].r).toBeCloseTo(expectedR);
  });

  it('returns 3 finder shapes with correct positions', () => {
    const scene = buildScene({ text: 'A' });
    const matrixSize = 21;
    const cellSize = 400 / matrixSize;

    const [topLeft, topRight, bottomLeft] = scene.finders;

    // Top-left at (0, 0)
    expect(topLeft.x).toBe(0);
    expect(topLeft.y).toBe(0);

    // Top-right at ((matrixSize-7)*cellSize, 0)
    expect(topRight.x).toBeCloseTo((matrixSize - 7) * cellSize);
    expect(topRight.y).toBe(0);

    // Bottom-left at (0, (matrixSize-7)*cellSize)
    expect(bottomLeft.x).toBe(0);
    expect(bottomLeft.y).toBeCloseTo((matrixSize - 7) * cellSize);
  });

  describe('logo padding', () => {
    it('padding expands the dot exclusion zone', () => {
      const withoutPadding = buildScene({
        text: 'A',
        logo: { src: 'x', width: 80, height: 80, padding: 0 },
      });
      const withPadding = buildScene({
        text: 'A',
        logo: { src: 'x', width: 80, height: 80, padding: 20 },
      });
      expect(withPadding.dots.length).toBeLessThan(withoutPadding.dots.length);
    });

    it('padding 0 is equivalent to omitting padding', () => {
      const explicit = buildScene({
        text: 'A',
        logo: { src: 'x', width: 80, height: 80, padding: 0 },
      });
      const implicit = buildScene({ text: 'A', logo: { src: 'x', width: 80, height: 80 } });
      expect(explicit.dots.length).toBe(implicit.dots.length);
    });

    it('padding has no effect when logo dimensions are omitted', () => {
      const withPadding = buildScene({ text: 'A', logo: { src: 'x', padding: 20 } });
      const withoutLogo = buildScene({ text: 'A' });
      // No dimensions → sentinel 0 → no exclusion → same dot count as no logo
      expect(withPadding.dots.length).toBe(withoutLogo.dots.length);
    });
  });
});
