# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**dot-qr** is a QR code generation library where modules are rendered as circles instead of the traditional squares. Key characteristics:
- Standalone JavaScript/TypeScript library
- React component wrapper for React integration
- Supports a centered logo (circular empty space in the middle)
- Accepts: encoded string, background color (including transparent), logo URL/path
- Reference outputs: `qr-code.svg` and `qr-code.png` show the intended visual output

## Architecture Intent

The library has two layers:
1. **Core library** — pure QR generation logic, framework-agnostic, outputs SVG/canvas
2. **React wrapper** — component that wraps the core library for React usage

The SVG output uses `<circle>` elements (not `<rect>`) for each dark module. The center of the QR code reserves space for an optional logo image overlay.

## Development Setup

This project is not yet initialized. When setting up:

```bash
# Initialize package
npm init

# Suggested structure
src/
  index.ts          # Core library entry point
  react/index.tsx   # React component wrapper
```

## Implementation Notes

- Study `qr-code.svg` to understand the expected SVG structure — circles with coordinates derived from the QR matrix
- The QR encoding itself can leverage an existing library (e.g., `qrcode`) to get the boolean matrix, then render circles instead of squares
- The logo space is typically a centered region that masks out QR modules (the QR error correction level should be high — `H` — to tolerate the logo obscuring modules)
