import { beforeEach, vi } from "vitest";

const createMediaQueryList = (query: string): MediaQueryList =>
   ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
   }) as unknown as MediaQueryList;

const defaultMatchMedia = vi.fn(createMediaQueryList);

const storage = new Map<string, string>();
const localStorageMock: Storage = {
   get length() {
      return storage.size;
   },
   clear: () => storage.clear(),
   getItem: (key) => storage.get(key) ?? null,
   key: (index) => [...storage.keys()][index] ?? null,
   removeItem: (key) => {
      storage.delete(key);
   },
   setItem: (key, value) => {
      storage.set(key, String(value));
   },
};

Object.defineProperty(globalThis, "localStorage", {
   configurable: true,
   value: localStorageMock,
});

Object.defineProperty(globalThis, "matchMedia", {
   configurable: true,
   writable: true,
   value: defaultMatchMedia,
});

Object.defineProperty(globalThis, "scrollTo", {
   configurable: true,
   writable: true,
   value: vi.fn(),
});

Object.defineProperty(globalThis, "IntersectionObserver", {
   configurable: true,
   writable: true,
   value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
   },
});

Object.defineProperty(globalThis, "ResizeObserver", {
   configurable: true,
   writable: true,
   value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
   },
});

beforeEach(() => {
   Object.defineProperty(globalThis, "matchMedia", {
      configurable: true,
      writable: true,
      value: defaultMatchMedia,
   });
   globalThis.localStorage.clear();
   delete document.documentElement.dataset.motion;
   vi.clearAllMocks();
});
