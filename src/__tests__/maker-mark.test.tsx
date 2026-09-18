import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MakerMark from "@components/ui/MakerMark";
import MotionPreferenceControl from "@components/ui/MotionPreferenceControl";
import { BreakpointProvider } from "@hooks/BreakpointProvider";
import { MotionPreferenceProvider } from "@hooks/MotionPreferenceProvider";

afterEach(() => {
   vi.unstubAllGlobals();
   vi.restoreAllMocks();
});

describe("Maker motion", () => {
   it("runs only while the hero is in view and the document is visible", () => {
      let notify: IntersectionObserverCallback;
      let observed: Element;
      vi.stubGlobal(
         "IntersectionObserver",
         class {
            constructor(callback: IntersectionObserverCallback) {
               notify = callback;
            }
            observe(target: Element) {
               observed = target;
            }
            unobserve() {}
            disconnect() {}
         },
      );
      const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
      const { container } = render(
         <MotionPreferenceProvider>
            <MakerMark animated />
         </MotionPreferenceProvider>,
      );
      const mark = container.querySelector("[data-active]")!;
      const intersect = (isIntersecting: boolean) =>
         act(() =>
            notify(
               [
                  {
                     target: observed,
                     isIntersecting,
                  } as IntersectionObserverEntry,
               ],
               {} as IntersectionObserver,
            ),
         );

      expect(mark.getAttribute("data-active")).toBe("false");
      intersect(true);
      expect(mark.getAttribute("data-active")).toBe("true");

      hidden.mockReturnValue(true);
      fireEvent(document, new Event("visibilitychange"));
      expect(mark.getAttribute("data-active")).toBe("false");

      hidden.mockReturnValue(false);
      fireEvent(document, new Event("visibilitychange"));
      expect(mark.getAttribute("data-active")).toBe("true");
      intersect(false);
      expect(mark.getAttribute("data-active")).toBe("false");
   });

   it("honors the user's Full/Reduced toggle and preserves home-button labels", () => {
      const { container } = render(
         <BreakpointProvider>
            <MotionPreferenceProvider>
               <button aria-label="Home">
                  <MakerMark />
               </button>
               <MakerMark animated />
               <MotionPreferenceControl />
            </MotionPreferenceProvider>
         </BreakpointProvider>,
      );
      const animated = container.querySelector("[data-animated]")!;
      expect(animated.getAttribute("data-animated")).toBe("true");
      expect(screen.getByRole("button", { name: "Home" })).toBeTruthy();
      expect(screen.queryByRole("img")).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: /^Motion mode:/ }));
      expect(animated.getAttribute("data-animated")).toBe("false");
      fireEvent.click(screen.getByRole("button", { name: /^Motion mode:/ }));
      expect(animated.getAttribute("data-animated")).toBe("true");
   });
});
