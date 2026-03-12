Object.defineProperty(globalThis, "matchMedia", {
   writable: true,
   value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
   }),
});

Object.defineProperty(globalThis, "IntersectionObserver", {
   writable: true,
   value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
   },
});

Object.defineProperty(globalThis, "ResizeObserver", {
   writable: true,
   value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
   },
});
