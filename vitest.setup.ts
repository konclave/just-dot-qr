/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom/vitest';

if (typeof Path2D === 'undefined') {
  (global as any).Path2D = class Path2D {};
}
