// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

import { buildScene } from '../src/core/scene';
import { renderPNG } from '../src/renderers/png';

describe('renderPNG', () => {
  it('is a function', () => {
    expect(typeof renderPNG).toBe('function');
  });

  it('returns a Promise<Blob>', async () => {
    // Mock toBlob to call back with a fake Blob (jsdom doesn't implement canvas rendering)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['fake'], { type: 'image/png' }));
    });
    // Mock getContext to return a minimal CanvasRenderingContext2D-like object
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: '',
      arc: vi.fn(),
      beginPath: vi.fn(),
      fill: vi.fn(),
      strokeRect: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      stroke: vi.fn(),
      roundRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    const scene = buildScene({ text: 'hello' });
    const blob = await renderPNG(scene);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

  it('sets canvas dimensions to scene.size', async () => {
    const setSizeSpy = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['fake'], { type: 'image/png' }));
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: '',
      arc: vi.fn(),
      beginPath: vi.fn(),
      fill: vi.fn(),
      strokeRect: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      stroke: vi.fn(),
      roundRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    const scene = buildScene({ text: 'test', size: 300 });

    // Spy on width/height setters via document.createElement
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === 'canvas') {
        Object.defineProperty(el, 'width', {
          set: (v) => setSizeSpy('width', v),
          get: () => scene.size,
          configurable: true,
        });
        Object.defineProperty(el, 'height', {
          set: (v) => setSizeSpy('height', v),
          get: () => scene.size,
          configurable: true,
        });
      }
      return el;
    });

    await renderPNG(scene);

    expect(setSizeSpy).toHaveBeenCalledWith('width', 300);
    expect(setSizeSpy).toHaveBeenCalledWith('height', 300);
  });

  it('rejects when toBlob returns null', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(null);
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: '',
      arc: vi.fn(),
      beginPath: vi.fn(),
      fill: vi.fn(),
      strokeRect: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      stroke: vi.fn(),
      roundRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    const scene = buildScene({ text: 'hello' });

    await expect(renderPNG(scene)).rejects.toThrow('canvas.toBlob returned null');
  });

  it('throws when getContext returns null', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const scene = buildScene({ text: 'hello' });

    await expect(renderPNG(scene)).rejects.toThrow('Failed to get 2D context from canvas');
  });
});
