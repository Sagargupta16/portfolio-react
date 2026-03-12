import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// Mock WebGL and Three.js since jsdom doesn't support them
vi.mock("@react-three/fiber", () => ({
   Canvas: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="canvas">{children}</div>
   ),
   useFrame: vi.fn(),
}));

vi.mock("@react-three/drei", () => ({
   Float: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
   ),
   MeshDistortMaterial: () => null,
   PerformanceMonitor: () => null,
}));

vi.mock("@tsparticles/react", () => ({
   default: () => <div data-testid="particles" />,
   initParticlesEngine: () => Promise.resolve(),
}));

vi.mock("lenis", () => ({
   default: class {
      raf() {
         // no-op: test stub
      }
      destroy() {
         // no-op: test stub
      }
      scrollTo() {
         // no-op: test stub
      }
   },
}));

describe("App", () => {
   it("renders without crashing", async () => {
      const { default: App } = await import("../App");
      const { container } = render(<App />);
      expect(container.querySelector("main")).toBeTruthy();
   });
});

describe("Data files", () => {
   it("loads all project categories", async () => {
      const {
         getFeaturedProjects,
         getCollaborativeProjects,
         getOtherProjects,
      } = await import("@data/dataLoader");
      expect(getFeaturedProjects().length).toBeGreaterThan(0);
      expect(getCollaborativeProjects().length).toBeGreaterThan(0);
      expect(getOtherProjects().length).toBeGreaterThan(0);
   });

   it("every project has required fields", async () => {
      const {
         getFeaturedProjects,
         getCollaborativeProjects,
         getOtherProjects,
      } = await import("@data/dataLoader");
      const all = [
         ...getFeaturedProjects(),
         ...getCollaborativeProjects(),
         ...getOtherProjects(),
      ];
      for (const p of all) {
         expect(p.id).toBeDefined();
         expect(p.title).toBeTruthy();
         expect(p.description).toBeTruthy();
         expect(p.github).toBeTruthy();
         expect(Array.isArray(p.tools_tech)).toBe(true);
      }
   });

   it("loads certifications with valid badge fields", async () => {
      const { getCertifications } = await import("@data/dataLoader");
      const certs = getCertifications();
      expect(certs.length).toBeGreaterThan(0);
      for (const c of certs) {
         expect(c.badgeId).toBeTruthy();
         expect(c.badgeUrl).toContain("credly.com");
      }
   });
});
