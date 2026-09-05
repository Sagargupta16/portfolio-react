import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BreakpointProvider } from "@hooks/BreakpointProvider";
import useBreakpoint from "@hooks/useBreakpoint";
import { CONTENT_SECTIONS } from "@/constants/sections";

vi.mock("@pages/about/About", () => ({
   default: () => <section id="about">About section</section>,
}));
vi.mock("@pages/experience/Experience", () => ({
   default: () => <section id="experience">Experience section</section>,
}));
vi.mock("@pages/education/Education", () => ({
   default: () => <section id="education">Education section</section>,
}));
vi.mock("@pages/skill/Skill", () => ({
   default: () => <section id="skills">Skills section</section>,
}));
vi.mock("@pages/portfolio/Portfolio", () => ({
   default: () => <section id="projects">Projects section</section>,
}));
vi.mock("@pages/achievement/Achievement", () => ({
   default: () => <section id="achievements">Achievements section</section>,
}));
vi.mock("@pages/services/Services", () => ({
   default: () => <section id="services">Services section</section>,
}));
vi.mock("@pages/github/GitHub", () => ({
   default: () => <section id="stats">Stats section</section>,
}));
vi.mock("@pages/contact/Contact", () => ({
   default: () => <section id="contact">Contact section</section>,
}));

vi.mock("lenis", () => ({
   default: class {
      raf() {}
      destroy() {}
      scrollTo() {}
   },
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
