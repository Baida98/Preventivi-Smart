import "@testing-library/jest-dom";
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Estende i matchers di Vitest con quelli di jest-dom
expect.extend(matchers);

// Pulisce il DOM dopo ogni test
afterEach(() => {
  cleanup();
});
