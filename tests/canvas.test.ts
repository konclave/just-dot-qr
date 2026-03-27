import { describe, it, expect } from 'vitest'
import { createCanvas } from 'canvas'
import { buildScene } from '../src/core/scene'
import { renderCanvas } from '../src/renderers/canvas'

/**
 * Creates a mock CanvasRenderingContext2D that records all method calls.
 * Used to verify that the correct draw calls are made without needing
 * a full canvas implementation.
 */
function createMockCtx() {
  const calls: Array<{ method: string; args: unknown[] }> = []

  const record =
    (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args })
    }

  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    fillRect: record('fillRect'),
    strokeRect: record('strokeRect'),
    beginPath: record('beginPath'),
    arc: record('arc'),
    fill: record('fill'),
    stroke: record('stroke'),
    roundRect: record('roundRect'),
    drawImage: record('drawImage'),
    save: record('save'),
    restore: record('restore'),
    getCalls: () => calls,
    getCallsFor: (method: string) => calls.filter((c) => c.method === method),
  }

  return ctx as unknown as CanvasRenderingContext2D & {
    getCalls: () => Array<{ method: string; args: unknown[] }>
    getCallsFor: (method: string) => Array<{ method: string; args: unknown[] }>
  }
}

describe('renderCanvas', () => {
  it('runs without throwing for a basic scene', () => {
    const scene = buildScene({ text: 'Hello' })
    const canvas = createCanvas(scene.size, scene.size)
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D

    expect(() => renderCanvas(scene, ctx)).not.toThrow()
  })

  it('does not call fillRect for background when backgroundColor is transparent', () => {
    const scene = buildScene({ text: 'Hello', backgroundColor: 'transparent' })
    const mockCtx = createMockCtx()

    renderCanvas(scene, mockCtx)

    const fillRectCalls = mockCtx.getCallsFor('fillRect')
    // Any fillRect calls should not be the background fill (which uses scene.size)
    const backgroundFills = fillRectCalls.filter(
      (c) => c.args[0] === 0 && c.args[1] === 0 && c.args[2] === scene.size && c.args[3] === scene.size
    )
    expect(backgroundFills).toHaveLength(0)
  })

  it('calls fillRect for background when backgroundColor is set', () => {
    const scene = buildScene({ text: 'Hello', backgroundColor: '#000000' })
    const mockCtx = createMockCtx()

    renderCanvas(scene, mockCtx)

    const fillRectCalls = mockCtx.getCallsFor('fillRect')
    const backgroundFills = fillRectCalls.filter(
      (c) => c.args[0] === 0 && c.args[1] === 0 && c.args[2] === scene.size && c.args[3] === scene.size
    )
    expect(backgroundFills).toHaveLength(1)
  })

  it('produces a non-empty canvas (at least one non-transparent pixel) after drawing dots', () => {
    const scene = buildScene({ text: 'Hello', dotColor: '#ff0000', backgroundColor: '#000000' })
    const canvas = createCanvas(scene.size, scene.size)
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D

    renderCanvas(scene, ctx)

    // Read pixel data from the canvas
    const rawCtx = canvas.getContext('2d')
    const imageData = rawCtx.getImageData(0, 0, scene.size, scene.size)
    const data = imageData.data

    // Check that there is at least one non-transparent pixel (alpha > 0)
    let hasNonTransparent = false
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) {
        hasNonTransparent = true
        break
      }
    }
    expect(hasNonTransparent).toBe(true)
  })

  it('calls arc for each dot in the scene', () => {
    const scene = buildScene({ text: 'Hi', finderStyle: 'circles' })
    const mockCtx = createMockCtx()

    renderCanvas(scene, mockCtx)

    const arcCalls = mockCtx.getCallsFor('arc')
    // Each dot uses one arc call; each circle finder uses 2 arc calls (outer + inner)
    const dotArcs = scene.dots.length
    const finderArcs = scene.finders.length * 2
    expect(arcCalls.length).toBe(dotArcs + finderArcs)
  })

  it('calls strokeRect and fillRect for squares finder style', () => {
    const scene = buildScene({ text: 'Hi', finderStyle: 'squares' })
    const mockCtx = createMockCtx()

    renderCanvas(scene, mockCtx)

    const strokeRectCalls = mockCtx.getCallsFor('strokeRect')
    const fillRectCalls = mockCtx.getCallsFor('fillRect')

    // 3 finders, each gets 1 strokeRect (outer) + 1 fillRect (inner)
    expect(strokeRectCalls).toHaveLength(scene.finders.length)
    // fillRect: 3 from finder inner fills (no background since default is transparent)
    expect(fillRectCalls).toHaveLength(scene.finders.length)
  })

  it('calls roundRect for rounded finder style', () => {
    const scene = buildScene({ text: 'Hi', finderStyle: 'rounded' })
    const mockCtx = createMockCtx()

    renderCanvas(scene, mockCtx)

    const roundRectCalls = mockCtx.getCallsFor('roundRect')
    // 3 finders, each uses 2 roundRect calls (outer + inner)
    expect(roundRectCalls).toHaveLength(scene.finders.length * 2)
  })

  it('calls drawImage when logoImage is provided', () => {
    const scene = buildScene({
      text: 'Hello',
      logo: { src: 'logo.png', width: 60, height: 60 },
    })
    const mockCtx = createMockCtx()
    const fakeImage = {} as HTMLImageElement

    renderCanvas(scene, mockCtx, fakeImage)

    const drawImageCalls = mockCtx.getCallsFor('drawImage')
    expect(drawImageCalls).toHaveLength(1)
    expect(drawImageCalls[0].args[0]).toBe(fakeImage)
    expect(drawImageCalls[0].args[3]).toBe(60) // width
    expect(drawImageCalls[0].args[4]).toBe(60) // height
  })

  it('does not call drawImage when logoImage is not provided', () => {
    const scene = buildScene({
      text: 'Hello',
      logo: { src: 'logo.png', width: 60, height: 60 },
    })
    const mockCtx = createMockCtx()

    renderCanvas(scene, mockCtx)

    const drawImageCalls = mockCtx.getCallsFor('drawImage')
    expect(drawImageCalls).toHaveLength(0)
  })

  it('does not call drawImage when logoImage is null', () => {
    const scene = buildScene({
      text: 'Hello',
      logo: { src: 'logo.png', width: 60, height: 60 },
    })
    const mockCtx = createMockCtx()

    renderCanvas(scene, mockCtx, null)

    const drawImageCalls = mockCtx.getCallsFor('drawImage')
    expect(drawImageCalls).toHaveLength(0)
  })

  it('drawImage without width/height when logo dimensions are 0', () => {
    const scene = buildScene({
      text: 'Hello',
      logo: { src: 'logo.png' },
    })
    const mockCtx = createMockCtx()
    const fakeImage = {} as HTMLImageElement

    renderCanvas(scene, mockCtx, fakeImage)

    const drawImageCalls = mockCtx.getCallsFor('drawImage')
    expect(drawImageCalls).toHaveLength(1)
    // Should only pass x, y (3 args total: image, x, y)
    expect(drawImageCalls[0].args).toHaveLength(3)
  })
})
