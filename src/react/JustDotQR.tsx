import React from "react";
import { buildScene } from "../core/scene";
import { renderCanvas } from "../renderers/canvas";
import type { JustDotQROptions, FinderShape } from "../types";

export type JustDotQRProps = JustDotQROptions & {
  renderAs?: "svg" | "canvas";
} & Omit<React.SVGProps<SVGSVGElement>, "width" | "height" | "viewBox">;

export function JustDotQR(props: JustDotQRProps): React.ReactElement {
  const {
    text,
    size = 400,
    dotColor = "#ffffff",
    backgroundColor = "transparent",
    dotScale = 0.6,
    finderStyle = "rounded",
    logo,
    errorCorrectionLevel = "H",
    renderAs = "svg",
    ...svgProps
  } = props;

  const options: JustDotQROptions = {
    text,
    size,
    dotColor,
    backgroundColor,
    dotScale,
    finderStyle,
    logo,
    errorCorrectionLevel,
  };

  if (renderAs === "canvas") {
    return <CanvasQR {...options} />;
  }

  const scene = buildScene(options);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={scene.size}
      height={scene.size}
      viewBox={`0 0 ${scene.size} ${scene.size}`}
      {...svgProps}
    >
      {/* Background */}
      {scene.backgroundColor !== "transparent" && (
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

/**
 * Canvas renderer implemented as a class component to avoid hook dispatcher
 * dependency. Hooks rely on ReactCurrentDispatcher.current being set by the
 * renderer; in apps where react resolves to a different module instance than
 * react-dom (duplicate React in the bundle), that dispatcher is null and hooks
 * throw. Class lifecycle methods are called directly by the renderer — no
 * dispatcher involved.
 */
class CanvasQR extends React.Component<JustDotQROptions> {
  private canvas: HTMLCanvasElement | null = null;
  private logoImage: HTMLImageElement | null = null;

  componentDidMount() {
    this.draw();
    if (this.props.logo?.src) {
      this.loadLogo(this.props.logo.src);
    }
  }

  componentDidUpdate(prevProps: JustDotQROptions) {
    if (prevProps.logo?.src !== this.props.logo?.src) {
      this.logoImage = null;
      if (this.props.logo?.src) {
        this.loadLogo(this.props.logo.src);
      }
    }
    this.draw();
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
    if (!this.canvas) return;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;
    const scene = buildScene(this.props);
    ctx.clearRect(0, 0, scene.size, scene.size);
    renderCanvas(scene, ctx, this.logoImage);
  }

  render() {
    const scene = buildScene(this.props);
    return (
      <canvas
        ref={(el) => {
          this.canvas = el;
        }}
        width={scene.size}
        height={scene.size}
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

  if (style === "squares") {
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

  if (style === "rounded") {
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
