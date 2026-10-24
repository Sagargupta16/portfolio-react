import { useSyncExternalStore } from "react";

/* A module-level value shared by components that sit far apart in the tree,
   without a context provider. `set` notifies subscribers only when the value
   changes; `useValue` reads it through useSyncExternalStore, with the initial
   value standing in on the server. */
export const createStore = <T>(initial: T) => {
   let value = initial;
   const listeners = new Set<() => void>();

   const subscribe = (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
   };

   return {
      get: () => value,
      /** `notify: false` updates the value without waking subscribers. */
      set: (next: T, notify = true) => {
         if (Object.is(value, next)) return;
         value = next;
         if (notify) for (const listener of listeners) listener();
      },
      useValue: () =>
         useSyncExternalStore(
            subscribe,
            () => value,
            () => initial,
         ),
   };
};
