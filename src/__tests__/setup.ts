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
      observe() {
         // no-op: jsdom stub
      }
      unobserve() {
         // no-op: jsdom stub
      }
      disconnect() {
         // no-op: jsdom stub
      }
   },
});

Object.defineProperty(globalThis, "ResizeObserver", {
   writable: true,
   value: class {
      observe() {
         // no-op: jsdom stub
      }
      unobserve() {
         // no-op: jsdom stub
      }
      disconnect() {
         // no-op: jsdom stub
      }
   },
});
