/// <reference types="@testing-library/jest-dom" />
import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

beforeEach(() => {
  vi.mock('canvas-roundrect-polyfill', () => ({}));
});
