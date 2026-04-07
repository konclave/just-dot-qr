import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { JustDotQR } from "../src/react/JustDotQR";
import * as canvasRenderer from "../src/renderers/canvas";
import logoSrc from "../assets/just-logo.png";

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── SVG mode (default) ───────────────────────────────────────────────────────

describe("JustDotQR — SVG mode (default)", () => {
  it("renders an <svg> element", () => {
    const { container } = render(<JustDotQR text="hello" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("does not render a <canvas>", () => {
    const { container } = render(<JustDotQR text="hello" />);
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
  });

  it("sets width, height, and viewBox from size prop", () => {
    const { container } = render(<JustDotQR text="hello" size={300} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "300");
    expect(svg).toHaveAttribute("height", "300");
    expect(svg).toHaveAttribute("viewBox", "0 0 300 300");
  });

  it("renders <circle> elements for data dots", () => {
    const { container } = render(<JustDotQR text="hello" />);
    expect(container.querySelectorAll("circle").length).toBeGreaterThan(0);
  });

  it("reflects dotColor on circle fill", () => {
    const { container } = render(
      <JustDotQR text="hello" dotColor="#ff0000" finderStyle="squares" />,
    );
    const circles = Array.from(container.querySelectorAll("circle"));
    expect(circles.some((c) => c.getAttribute("fill") === "#ff0000")).toBe(
      true,
    );
  });

  it("passes extra props (className) to the svg element", () => {
    const { container } = render(
      <JustDotQR text="hello" className="qr-code" />,
    );
    expect(container.querySelector("svg")).toHaveClass("qr-code");
  });

  it("renders a background <rect> when backgroundColor is set", () => {
    const { container } = render(
      <JustDotQR text="hello" backgroundColor="#000000" />,
    );
    const rects = Array.from(container.querySelectorAll("rect"));
    expect(rects.some((r) => r.getAttribute("fill") === "#000000")).toBe(true);
  });

  it("omits background <rect> when backgroundColor is transparent + circles finder", () => {
    const { container } = render(
      <JustDotQR
        text="hello"
        backgroundColor="transparent"
        finderStyle="circles"
      />,
    );
    expect(container.querySelector("rect")).not.toBeInTheDocument();
  });

  it("renders <image> with correct href/width/height when logo is provided", () => {
    const { container } = render(
      <JustDotQR
        text="hello"
        logo={{ src: "https://example.com/logo.png", width: 60, height: 60 }}
      />,
    );
    const img = container.querySelector("image")!;
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("href", "https://example.com/logo.png");
    expect(img).toHaveAttribute("width", "60");
    expect(img).toHaveAttribute("height", "60");
  });

  it("renders logo from a locally imported image module", () => {
    const { container } = render(
      <JustDotQR text="hello" logo={{ src: logoSrc, width: 60, height: 60 }} />,
    );
    const img = container.querySelector("image")!;
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("href", logoSrc);
  });

  it('finderStyle="squares" renders <rect> finder elements', () => {
    const { container } = render(
      <JustDotQR text="hello" finderStyle="squares" />,
    );
    expect(container.querySelector("rect")).toBeInTheDocument();
  });

  it('finderStyle="rounded" renders <rect> finders with rx attribute', () => {
    const { container } = render(
      <JustDotQR text="hello" finderStyle="rounded" />,
    );
    const rects = Array.from(container.querySelectorAll("rect"));
    expect(rects.some((r) => r.hasAttribute("rx"))).toBe(true);
  });

  it('finderStyle="circles" renders only <circle> elements (no <rect>)', () => {
    const { container } = render(
      <JustDotQR
        text="hello"
        finderStyle="circles"
        backgroundColor="transparent"
      />,
    );
    expect(container.querySelector("rect")).not.toBeInTheDocument();
    expect(container.querySelectorAll("circle").length).toBeGreaterThan(0);
  });
});

// ─── Canvas mode ──────────────────────────────────────────────────────────────

describe("JustDotQR — canvas mode", () => {
  it("renders a <canvas> element", () => {
    const { container } = render(<JustDotQR text="hello" renderAs="canvas" />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("does not render an <svg>", () => {
    const { container } = render(<JustDotQR text="hello" renderAs="canvas" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("sets canvas width and height from size prop", () => {
    const { container } = render(
      <JustDotQR text="hello" renderAs="canvas" size={300} />,
    );
    const canvas = container.querySelector("canvas")!;
    expect(canvas).toHaveAttribute("width", "300");
    expect(canvas).toHaveAttribute("height", "300");
  });

  it("calls renderCanvas after mount", () => {
    const spy = vi.spyOn(canvasRenderer, "renderCanvas");
    render(<JustDotQR text="hello" renderAs="canvas" size={400} />);
    expect(spy).toHaveBeenCalledOnce();
  });

  it("calls renderCanvas again when a prop changes", () => {
    const spy = vi.spyOn(canvasRenderer, "renderCanvas");
    const { rerender } = render(
      <JustDotQR text="hello" renderAs="canvas" size={400} dotColor="#ffffff" />,
    );
    rerender(<JustDotQR text="hello" renderAs="canvas" size={400} dotColor="#000000" />);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("passes scene and context to renderCanvas", () => {
    const spy = vi.spyOn(canvasRenderer, "renderCanvas");
    render(<JustDotQR text="hello" renderAs="canvas" size={200} />);
    const [scene, ctx] = spy.mock.calls[0];
    expect(scene.size).toBe(200);
    expect(typeof ctx.fillRect).toBe("function");
  });

  it("loads logo image and redraws once it resolves", async () => {
    // Mock renderCanvas so drawImage is never called (avoids node-canvas type restrictions)
    const spy = vi
      .spyOn(canvasRenderer, "renderCanvas")
      .mockImplementation(() => {});

    // Stub Image so onload fires synchronously when src is assigned
    vi.stubGlobal(
      "Image",
      class {
        onload: (() => void) | null = null;
        set src(_: string) {
          this.onload?.();
        }
      },
    );

    render(
      <JustDotQR
        text="hello"
        renderAs="canvas"
        size={400}
        logo={{ src: "https://example.com/logo.png", width: 60 }}
      />,
    );

    // First call: mount (logoImage still null)
    // Second call: after Image.onload fires and logoImage state updates
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(2);
    });
    const [, , logoImage] = spy.mock.calls[1];
    expect(logoImage).not.toBeNull();
  });
});

// ─── Canvas auto-size ─────────────────────────────────────────────────────────

describe("JustDotQR — canvas auto-size", () => {
  it("measures container once on mount when size is omitted", () => {
    const observeSpy = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observeSpy;
        disconnect() {}
      },
    );
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      width: 320,
      height: 320,
      top: 0, left: 0, right: 320, bottom: 320, x: 0, y: 0,
      toJSON: () => {},
    } as DOMRect);

    const { container } = render(
      <div>
        <JustDotQR text="hello" renderAs="canvas" />
      </div>,
    );

    // no watchResize → observer should NOT be attached
    expect(observeSpy).not.toHaveBeenCalled();
    // canvas should have been sized to the measured container width
    const canvas = container.querySelector("canvas")!;
    expect(canvas).toHaveAttribute("width", "320");
    expect(canvas).toHaveAttribute("height", "320");
  });

  it("repaints when container resizes with watchResize", () => {
    let observerCallback!: ResizeObserverCallback;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: ResizeObserverCallback) {
          observerCallback = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      width: 200,
      height: 200,
      top: 0, left: 0, right: 200, bottom: 200, x: 0, y: 0,
      toJSON: () => {},
    } as DOMRect);

    const { container } = render(
      <div>
        <JustDotQR text="hello" renderAs="canvas" watchResize />
      </div>,
    );

    // Simulate a container resize to 480px
    act(() => {
      observerCallback(
        [{ contentRect: { width: 480 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      );
    });

    const canvas = container.querySelector("canvas")!;
    expect(canvas).toHaveAttribute("width", "480");
    expect(canvas).toHaveAttribute("height", "480");
  });

  it("does not measure container when size prop is provided", () => {
    const observeSpy = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observeSpy;
        disconnect() {}
      },
    );
    const getBCRSpy = vi.spyOn(Element.prototype, "getBoundingClientRect");

    const { container } = render(
      <JustDotQR text="hello" renderAs="canvas" size={300} />,
    );

    expect(observeSpy).not.toHaveBeenCalled();
    expect(getBCRSpy).not.toHaveBeenCalled();
    expect(container.querySelector("canvas")).toHaveAttribute("width", "300");
  });
});
