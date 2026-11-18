import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import { CONTENT_SECTIONS } from "@/constants/sections";
import { MEDIA_QUERIES } from "@/constants/theme";
import { getFeaturedProjects } from "@data/projects";
import { projectSlug } from "@utils/projectLink";

// Keep the real shell, navigation, project filters and contact form. Stub only
// unrelated sections and artwork; no request can send an email in these tests.
vi.mock("@pages/about/About", () => ({
   default: () => <div>About section</div>,
}));
vi.mock("@pages/news/News", () => ({
   default: () => <div>News section</div>,
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
vi.mock("@pages/achievement/Achievement", () => ({
   default: () => <div>Achievements section</div>,
}));
vi.mock("@pages/services/Services", () => ({
   default: () => <div>Services section</div>,
}));
vi.mock("@pages/stats/Stats", () => ({
   default: () => <div>Stats section</div>,
}));
vi.mock("@components/layout/AmbientBackground", () => ({
   default: () => null,
}));
vi.mock("@components/layout/StackFieldBackdrop", () => ({
   default: () => null,
}));
vi.mock("@components/layout/Header/HeroStackField", () => ({
   default: () => null,
}));
vi.mock("@pages/projects/covers/ProjectCover", () => ({
   default: () => null,
}));
vi.mock("@emailjs/browser", () => ({
   default: { sendForm: vi.fn() },
}));
vi.mock("lenis/react", () => ({
   ReactLenis: ({ children }: { children?: React.ReactNode }) =>
      children ?? null,
   useLenis: () => undefined,
}));

describe("navigation and persistent UI state", () => {
   it("preserves a real contact draft and focus through both motion modes", async () => {
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: "Contact Me" }));
      const name = await screen.findByRole<HTMLInputElement>(
         "textbox",
         { name: "Name" },
         { timeout: 5000 },
      );
      const email = screen.getByRole<HTMLInputElement>("textbox", {
         name: "Email",
      });
      const message = screen.getByRole<HTMLTextAreaElement>("textbox", {
         name: "Message",
      });
      fireEvent.change(name, { target: { value: "Draft sender" } });
      fireEvent.change(email, { target: { value: "draft@example.com" } });
      fireEvent.change(message, {
         target: { value: "Keep this unsent draft." },
      });
      // Navigation focuses the section when its scroll completes; let that
      // land first, or on a slow runner it arrives after the toggle is focused.
      await waitFor(
         () =>
            expect(document.activeElement).toBe(
               document.getElementById("contact"),
            ),
         { timeout: 5000 },
      );

      for (const mode of ["reduced", "full"]) {
         const toggle = screen.getByRole("button", { name: /^Motion mode:/ });
         toggle.focus();
         fireEvent.click(toggle);
         await waitFor(() =>
            expect(document.documentElement.dataset.motion).toBe(mode),
         );
         expect(document.activeElement).toBe(toggle);
         expect(name.isConnected).toBe(true);
         expect(name.value).toBe("Draft sender");
         expect(email.value).toBe("draft@example.com");
         expect(message.value).toBe("Keep this unsent draft.");
      }
   }, 15_000);

   it("preserves the real project filter when motion changes", async () => {
      render(<App />);
      fireEvent.click(
         screen.getByRole("button", { name: "Navigate to Projects" }),
      );
      const all = await screen.findByRole(
         "button",
         { name: /^All \(\d+ projects\)$/ },
         { timeout: 5000 },
      );
      fireEvent.click(all);
      fireEvent.click(screen.getByRole("button", { name: /^Motion mode:/ }));
      await waitFor(() =>
         expect(document.documentElement.dataset.motion).toBe("reduced"),
      );
      expect(all.isConnected).toBe(true);
      expect(all.getAttribute("aria-pressed")).toBe("true");
      expect(globalThis.location.hash).toBe("#projects");
   });

   it("reopens the project from an address copied after scrolling from another section", async () => {
      const { title } = getFeaturedProjects()[0];
      globalThis.history.replaceState(
         null,
         "",
         "/portfolio-react/?ref=cv#contact",
      );
      const page = render(<App />);
      // A visitor can scroll back up from Contact without changing its hash.
      fireEvent.click(
         await screen.findByRole("button", {
            name: `View details for ${title}`,
         }),
      );
      const address = new URL(globalThis.location.href);
      expect(address.hash).toBe("#projects");
      expect(address.searchParams.get("project")).toBe(projectSlug(title));
      expect(address.searchParams.get("ref")).toBe("cv");
      page.unmount();
      render(<App />);
      expect(await screen.findByRole("dialog", { name: title })).toBeTruthy();
   });

   it.each(["", "#about"])(
      "resolves a legacy project address with fragment '%s'",
      async (fragment) => {
         const { title } = getFeaturedProjects()[0];
         globalThis.history.replaceState(
            null,
            "",
            `?project=${projectSlug(title)}${fragment}`,
         );
         render(<App />);
         expect(
            await screen.findByRole("dialog", { name: title }),
         ).toBeTruthy();
         await waitFor(() => {
            expect(globalThis.location.hash).toBe("#projects");
            expect(
               vi.mocked(HTMLElement.prototype.scrollIntoView).mock.contexts,
            ).toContain(document.getElementById("projects"));
         });
      },
   );

   it("preserves the requested section when a legacy project slug is stale", async () => {
      globalThis.history.replaceState(
         null,
         "",
         "?ref=cv&project=removed-project#about",
      );
      render(<App />);
      await waitFor(() => expect(globalThis.location.search).toBe("?ref=cv"));
      expect(globalThis.location.hash).toBe("#about");
      expect(screen.queryByRole("dialog")).toBeNull();
   });

   it("closes and restores project details with browser Back and Forward", async () => {
      const { title } = getFeaturedProjects()[0];
      render(<App />);
      fireEvent.click(
         screen.getByRole("button", { name: "Navigate to Projects" }),
      );
      fireEvent.click(
         await screen.findByRole("button", {
            name: `View details for ${title}`,
         }),
      );
      expect(await screen.findByRole("dialog", { name: title })).toBeTruthy();
      globalThis.history.back();
      await waitFor(() => {
         expect(globalThis.location.hash).toBe("");
         expect(document.documentElement.style.overflow).not.toBe("hidden");
         expect(screen.queryByRole("dialog")).toBeNull();
      });
      globalThis.history.forward();
      expect(await screen.findByRole("dialog", { name: title })).toBeTruthy();
      expect(document.documentElement.style.overflow).toBe("hidden");
   });

   it("repairs a legacy history entry for the already open project in place", async () => {
      const { title } = getFeaturedProjects()[0];
      const query = `?project=${projectSlug(title)}`;
      const { history } = globalThis;
      history.replaceState("legacy", "", `${query}#about`);
      history.pushState("canonical", "", `${query}#projects`);
      const entries = history.length;
      render(<App />);
      const dialog = await screen.findByRole("dialog", { name: title });

      history.back();
      await waitFor(() => {
         expect(history.state).toBe("legacy");
         expect(globalThis.location.hash).toBe("#projects");
      });
      expect(screen.getByRole("dialog", { name: title })).toBe(dialog);
      expect(history.length).toBe(entries);
      history.forward();
      await waitFor(() => expect(history.state).toBe("canonical"));
   });

   it("reveals the destination chosen from search after opening the mobile menu", async () => {
      const media = globalThis.matchMedia("");
      globalThis.matchMedia = (query) => ({
         ...media,
         media: query,
         matches:
            query === MEDIA_QUERIES.mobile || query === MEDIA_QUERIES.tablet,
      });
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(
         screen.getByRole("dialog", { name: "Navigation menu" }),
      ).toBeTruthy();
      fireEvent.click(
         screen.getByRole("button", { name: "Open command palette" }),
      );
      fireEvent.click(await screen.findByRole("option", { name: /cd about/ }));
      await waitFor(() => {
         expect(globalThis.location.hash).toBe("#about");
         expect(document.documentElement.style.overflow).not.toBe("hidden");
         expect(screen.queryByRole("dialog")).toBeNull();
      });
   });

   it("loads and focuses a direct contact link after preceding sections mount", async () => {
      globalThis.history.replaceState(null, "", "/portfolio-react/#contact");
      render(<App />);
      await screen.findByRole(
         "textbox",
         { name: "Message" },
         { timeout: 5000 },
      );
      await waitFor(() =>
         expect(document.activeElement).toBe(
            document.getElementById("contact"),
         ),
      );
      expect(document.querySelectorAll("[data-section-ready]")).toHaveLength(
         CONTENT_SECTIONS.length,
      );
      expect(
         vi.mocked(HTMLElement.prototype.scrollIntoView).mock.contexts,
      ).toContain(document.getElementById("contact"));
      expect(globalThis.scrollTo).not.toHaveBeenCalledWith(0, 0);
   });

   it("handles browser history navigation without reloading the application", async () => {
      render(<App />);
      globalThis.history.pushState(null, "", "#contact");
      fireEvent.popState(window);
      const message = await screen.findByRole(
         "textbox",
         { name: "Message" },
         { timeout: 5000 },
      );
      fireEvent.change(message, {
         target: { value: "A draft before going back." },
      });

      globalThis.history.replaceState(null, "", "#hero");
      fireEvent.popState(window);
      await waitFor(() =>
         expect(document.activeElement).toBe(document.getElementById("hero")),
      );
      expect(message.isConnected).toBe(true);
      expect((message as HTMLTextAreaElement).value).toBe(
         "A draft before going back.",
      );
   });
});
