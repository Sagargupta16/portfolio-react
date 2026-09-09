import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

// Keep the real shell, navigation, project filters and contact form. Stub only
// unrelated sections and artwork; no request can send an email in these tests.
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
      fireEvent.click(
         screen.getByRole("button", { name: "Navigate to Contact" }),
      );
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
      expect(document.querySelectorAll("[data-section-ready]")).toHaveLength(9);
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
