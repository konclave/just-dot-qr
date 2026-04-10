import React from 'react';

import { buildScene } from '../core/scene';
import { renderCanvas } from '../renderers/canvas';
import type { JustDotQROptions, FinderShape } from '../types';

export type JustDotQRProps = JustDotQROptions & {
  renderAs?: 'svg' | 'canvas';
  /**
   * Canvas only. When true, a ResizeObserver watches the parent container and
   * repaints whenever its width changes. Has no effect when `size` is set
   * explicitly or when `renderAs` is `"svg"`.
   */
  watchResize?: boolean;
} & Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height' | 'viewBox'>;

export function JustDotQR(props: JustDotQRProps): React.ReactElement {
  const {
    text,
    size, // no default — CanvasQR needs to distinguish undefined from 400
    dotColor = '#ffffff',
    backgroundColor = 'transparent',
    dotScale = 0.6,
    finderStyle = 'rounded',
    logo,
    errorCorrectionLevel = 'H',
    renderAs = 'svg',
    watchResize,
    ...svgProps
  } = props;

  if (renderAs === 'canvas') {
    return (
      <CanvasQR
        text={text}
        size={size}
        dotColor={dotColor}
        backgroundColor={backgroundColor}
        dotScale={dotScale}
        finderStyle={finderStyle}
        logo={logo}
        errorCorrectionLevel={errorCorrectionLevel}
        watchResize={watchResize}
      />
    );
  }

  const scene = buildScene({
    text,
    size: size ?? 400,
    dotColor,
    backgroundColor,
    dotScale,
    finderStyle,
    logo,
    errorCorrectionLevel,
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={scene.size}
      height={scene.size}
      viewBox={`0 0 ${scene.size} ${scene.size}`}
      {...svgProps}
    >
      {/* Background */}
      {scene.backgroundColor !== 'transparent' && (
        <rect width="100%" height="100%" fill={scene.backgroundColor} />
      )}

      {/* Data dots */}
      {scene.dots.map((dot, i) => (
        <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.color} />
      ))}

      {/* Finder patterns */}
      {scene.finders.map((finder, i) => (
        <React.Fragment key={i}>{renderFinder(finder)}</React.Fragment>
      ))}

      {/* Logo */}
      {scene.logo && (
        <image
          href={scene.logo.src}
          x={scene.logo.x}
          y={scene.logo.y}
          {...(scene.logo.width > 0 && scene.logo.height > 0
            ? { width: scene.logo.width, height: scene.logo.height }
            : {})}
        />
      )}
    </svg>
  );
}

interface CanvasQRProps extends JustDotQROptions {
  watchResize?: boolean;
}

interface CanvasQRState {
  measuredSize: number;
}

/**
 * Canvas renderer implemented as a class component to avoid hook dispatcher
 * dependency. Hooks rely on ReactCurrentDispatcher.current being set by the
 * renderer; in apps where react resolves to a different module instance than
 * react-dom (duplicate React in the bundle), that dispatcher is null and hooks
 * throw. Class lifecycle methods are called directly by the renderer — no
 * dispatcher involved.
 */
class CanvasQR extends React.Component<CanvasQRProps, CanvasQRState> {
  state: CanvasQRState = { measuredSize: 0 };
  private canvas: HTMLCanvasElement | null = null;
  private logoImage: HTMLImageElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  componentDidMount() {
    if (this.props.size === undefined) {
      this.measureContainer();
      if (this.props.watchResize) this.setupObserver();
    }
    this.draw();
    if (this.props.logo?.src) this.loadLogo(this.props.logo.src);
  }

  componentDidUpdate(prevProps: CanvasQRProps) {
    // watchResize toggled on
    if (!prevProps.watchResize && this.props.watchResize && this.props.size === undefined) {
      this.setupObserver();
    }
    // watchResize toggled off
    if (prevProps.watchResize && !this.props.watchResize) {
      this.teardownObserver();
    }
    // switched from explicit size to auto-size
    if (prevProps.size !== undefined && this.props.size === undefined) {
      this.measureContainer();
      if (this.props.watchResize) this.setupObserver();
    }
    // switched from auto-size to explicit size
    if (prevProps.size === undefined && this.props.size !== undefined) {
      this.teardownObserver();
    }
    // logo src changed
    if (prevProps.logo?.src !== this.props.logo?.src) {
      this.logoImage = null;
      if (this.props.logo?.src) this.loadLogo(this.props.logo.src);
    }
    this.draw();
  }

  componentWillUnmount() {
    this.teardownObserver();
  }

  private measureContainer() {
    const parent = this.canvas?.parentElement;
    if (!parent) return;
    const width = Math.round(parent.getBoundingClientRect().width);
    if (width > 0) this.setState({ measuredSize: width });
  }

  private setupObserver() {
    if (this.resizeObserver) return;
    const parent = this.canvas?.parentElement;
    if (!parent) return;
    this.resizeObserver = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w > 0 && w !== this.state.measuredSize) this.setState({ measuredSize: w });
    });
    this.resizeObserver.observe(parent);
  }

  private teardownObserver() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private effectiveSize(): number {
    return this.props.size ?? this.state.measuredSize;
  }

  private loadLogo(src: string) {
    const img = new Image();
    img.onload = () => {
      this.logoImage = img;
      this.draw();
    };
    img.src = src;
  }

  private draw() {
    const size = this.effectiveSize();
    if (!size || !this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    const scene = buildScene({ ...this.props, size });
    ctx.clearRect(0, 0, size, size);
    renderCanvas(scene, ctx, this.logoImage);
  }

  render() {
    const size = this.effectiveSize();
    return (
      <canvas
        ref={(el) => {
          this.canvas = el;
        }}
        {...(size ? { width: size, height: size } : { style: { display: 'block', width: '100%' } })}
      />
    );
  }
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

function renderFinder(finder: FinderShape): React.ReactElement {
  const { x, y, cellSize, style, color } = finder;
  const cx = round2(x + 3.5 * cellSize);
  const cy = round2(y + 3.5 * cellSize);

  if (style === 'squares') {
    return (
      <g>
        <rect
          x={round2(x + cellSize / 2)}
          y={round2(y + cellSize / 2)}
          width={round2(6 * cellSize)}
          height={round2(6 * cellSize)}
          fill="none"
          stroke={color}
          strokeWidth={round2(cellSize)}
        />
        <rect
          x={round2(x + 2 * cellSize)}
          y={round2(y + 2 * cellSize)}
          width={round2(3 * cellSize)}
          height={round2(3 * cellSize)}
          fill={color}
        />
      </g>
    );
  }

  if (style === 'rounded') {
    return (
      <g>
        <rect
          x={round2(x + cellSize / 2)}
          y={round2(y + cellSize / 2)}
          width={round2(6 * cellSize)}
          height={round2(6 * cellSize)}
          rx={round2(1.5 * cellSize)}
          fill="none"
          stroke={color}
          strokeWidth={round2(cellSize)}
        />
        <rect
          x={round2(x + 2 * cellSize)}
          y={round2(y + 2 * cellSize)}
          width={round2(3 * cellSize)}
          height={round2(3 * cellSize)}
          rx={round2(0.75 * cellSize)}
          fill={color}
        />
      </g>
    );
  }

  // style === 'circles'
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={round2(3 * cellSize)}
        fill="none"
        stroke={color}
        strokeWidth={round2(cellSize)}
      />
      <circle cx={cx} cy={cy} r={round2(1.5 * cellSize)} fill={color} />
    </g>
  );
}
