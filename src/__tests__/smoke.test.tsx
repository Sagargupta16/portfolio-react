import {
   act,
   fireEvent,
   render,
   screen,
   waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BreakpointProvider } from "@hooks/BreakpointProvider";
import useBreakpoint from "@hooks/useBreakpoint";
import { CONTENT_SECTIONS } from "@/constants/sections";

vi.mock("@pages/about/About", () => ({
   default: () => <div>About section</div>,
}));
vi.mock("@pages/experience/Experience", () => ({
   default: () => <div>Experience section</div>,
}));
vi.mock("@pages/education/Education", () => ({
   default: () => <div>Education section</div>,
}));
vi.mock("@pages/skill/Skill", () => ({
   default: () => <div>Skills section</div>,
}));
vi.mock("@pages/projects/Projects", () => ({
   default: () => <div>Projects section</div>,
}));
vi.mock("@pages/achievement/Achievement", () => ({
   default: () => <div>Achievements section</div>,
}));
vi.mock("@pages/services/Services", () => ({
   default: () => <div>Services section</div>,
}));
vi.mock("@pages/stats/Stats", () => ({
   default: () => <div>Stats section</div>,
}));
vi.mock("@pages/contact/Contact", () => ({
   default: () => <div>Contact section</div>,
}));

vi.mock("lenis/react", () => ({
   ReactLenis: ({ children }: { children?: React.ReactNode }) =>
      children ?? null,
   useLenis: () => undefined,
}));

describe("application shell", () => {
   it("renders every lazy section with one stable ID", async () => {
      const observed = new Set<string>();
      Object.defineProperty(globalThis, "IntersectionObserver", {
         configurable: true,
         value: class {
            observe(element: Element) {
               if (element.id) observed.add(element.id);
            }
            unobserve() {}
            disconnect() {}
         },
      });

      const { default: App } = await import("../App");
      const { container } = render(<App />);
      expect(container.querySelector("main")).toBeTruthy();
      expect(screen.queryByText("Contact section")).toBeNull();
      fireEvent.click(
         screen.getByRole("button", { name: "Navigate to Contact" }),
      );
      await screen.findByText("Contact section");

      for (const section of CONTENT_SECTIONS) {
         expect(container.querySelectorAll(`#${section.id}`)).toHaveLength(1);
      }
      await waitFor(() => {
         expect(observed).toEqual(
            new Set(["hero", ...CONTENT_SECTIONS.map(({ id }) => id)]),
         );
      });
   }, 15_000);

   it("mounts an approaching section without loading distant sections", async () => {
      const observers: {
         callback: IntersectionObserverCallback;
         options?: IntersectionObserverInit;
         elements: Element[];
      }[] = [];
      Object.defineProperty(globalThis, "IntersectionObserver", {
         configurable: true,
         value: class {
            entry: (typeof observers)[number];
            constructor(
               callback: IntersectionObserverCallback,
               options?: IntersectionObserverInit,
            ) {
               this.entry = { callback, options, elements: [] };
               observers.push(this.entry);
            }
            observe(element: Element) {
               this.entry.elements.push(element);
            }
            unobserve() {}
            disconnect() {}
         },
      });

      const { default: App } = await import("../App");
      render(<App />);
      expect(screen.queryByText("Skills section")).toBeNull();
      const approaching = observers.find(
         ({ options, elements }) =>
            options?.rootMargin === "400px 0px" &&
            elements.some((element) => element.id === "skills"),
      );
      expect(approaching).toBeDefined();
      await act(async () => {
         approaching?.callback(
            [
               {
                  isIntersecting: true,
                  target: screen.getByRole("region", { name: "Skills" }),
                  boundingClientRect: new DOMRect(),
                  intersectionRect: new DOMRect(),
                  intersectionRatio: 1,
                  rootBounds: null,
                  time: 0,
               },
            ],
            {} as IntersectionObserver,
         );
      });

      expect(await screen.findByText("Skills section")).toBeTruthy();
      expect(screen.queryByText("Contact section")).toBeNull();
      expect(screen.queryByText("Projects section")).toBeNull();
   });

   it("shares two media-query subscriptions across breakpoint consumers", () => {
      const matchMedia = vi.fn((query: string) => ({
         matches: false,
         media: query,
         onchange: null,
         addListener: vi.fn(),
         removeListener: vi.fn(),
         addEventListener: vi.fn(),
         removeEventListener: vi.fn(),
         dispatchEvent: vi.fn(() => false),
      }));
      Object.defineProperty(globalThis, "matchMedia", {
         configurable: true,
         value: matchMedia,
      });

      const Probe = () => {
         const value = useBreakpoint();
         return <span>{String(value.isMobile)}</span>;
      };

      render(
         <BreakpointProvider>
            <Probe />
            <Probe />
         </BreakpointProvider>,
      );
      expect(matchMedia).toHaveBeenCalledTimes(2);
   });
});
