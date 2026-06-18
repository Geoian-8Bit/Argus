import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom no implementa matchMedia; lo necesitan componentes que leen
// preferencias del sistema (p. ej. el motor de temas).
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
