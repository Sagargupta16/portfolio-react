import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MotionPreferenceProvider } from "@hooks/MotionPreferenceProvider";
import useMotionPreference from "@hooks/useMotionPreference";
import MotionPreferenceControl from "@components/ui/MotionPreferenceControl";
import QuickFacts from "@pages/about/QuickFacts";
import ExpandableExtras from "@pages/education/ExpandableExtras";
import ProjectCard from "@pages/portfolio/ProjectCard";
import TimelineCardContent from "@pages/experience/TimelineCardContent";
import type { Education, ProfessionalExperience, Project } from "@/types";

const renderWithMotion = (ui: React.ReactNode) =>
   render(<MotionPreferenceProvider>{ui}</MotionPreferenceProvider>);

const project: Project & { category: string } = {
   id: 3,
   title: "Portfolio React",
   description: "A portfolio project.",
   date: "September 2026",
   tools_tech: ["React", "TypeScript"],
   features: ["Accessible details"],
   github: "https://github.com/Sagargupta16/portfolio-react",
   live: "https://sagargupta.online/portfolio-react/",
   category: "Featured",
};

const education: Education = {
   id: 99,
   date: "2020 - 2024",
   title: "Degree",
   institution: "University",
   location: "City",
   cgpa: "9.0",
   achievements: ["Graduated with distinction"],
   skills: ["TypeScript"],
};

const experience: ProfessionalExperience = {
   id: 99,
   date: "2024 - Present",
   title: "Engineer",
   position: "Full-time",
   company: "Example Company",
   location: "Remote",
   summary: "Builds reliable systems.",
   projects: [
      {
         name: "Platform",
         description: { "1": "Built a platform." },
         skills: ["AWS"],
      },
   ],
};

describe("accessible interactions", () => {
   it("renders the concise role without a duplicate employer suffix", () => {
      render(<QuickFacts isMobile={false} />);
      expect(screen.getByText("Cloud Consultant @ AWS")).toBeTruthy();
      expect(screen.queryByText(/AWS @ AWS/)).toBeNull();
   });

   it("uses an explicit project Details button without nesting links in a pseudo-button", () => {
      const onOpen = vi.fn();
      const { container } = renderWithMotion(
         <ProjectCard data={project} onOpen={onOpen} />,
      );
      const details = screen.getByRole("button", {
         name: "View details for Portfolio React",
      });
      const source = screen.getByRole("link", {
         name: /View Portfolio React on GitHub/,
      });

      expect(container.querySelector('[role="button"]')).toBeNull();
      fireEvent.keyDown(source, { key: "Enter" });
      expect(onOpen).not.toHaveBeenCalled();
      fireEvent.click(details);
      expect(onOpen).toHaveBeenCalledOnce();
   });

   it("connects education disclosure state to its panel", () => {
      render(<ExpandableExtras item={education} marginLeft={0} />);
      const trigger = screen.getByRole("button", { name: /1 Achievements/ });
      const panelId = trigger.getAttribute("aria-controls");
      expect(trigger.getAttribute("aria-expanded")).toBe("false");

      fireEvent.click(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(document.getElementById(panelId ?? "")).toBeTruthy();
      expect(screen.getByText("Graduated with distinction")).toBeTruthy();
   });

   it("keeps timeline headings outside the explicit Details control", () => {
      const onClick = vi.fn();
      const { container } = render(
         <TimelineCardContent
            item={experience}
            accentColor="#60a5fa"
            isMobile={false}
            onClick={onClick}
         />,
      );
      const button = screen.getByRole("button", {
         name: "View details for Example Company",
      });
      expect(button.querySelector("h3")).toBeNull();
      expect(container.querySelector("h3")?.textContent).toBe(
         "Example Company",
      );
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledOnce();
   });

   it("defaults to Full and lets System follow a reduced OS preference", async () => {
      Object.defineProperty(globalThis, "matchMedia", {
         configurable: true,
         value: vi.fn((query: string) => ({
            matches: query.includes("prefers-reduced-motion"),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(() => false),
         })),
      });

      const Probe = () => {
         const { reducedMotion } = useMotionPreference();
         return <output>{reducedMotion ? "reduced" : "full"}</output>;
      };

      renderWithMotion(
         <>
            <MotionPreferenceControl />
            <Probe />
         </>,
      );
      expect(screen.getByText("full")).toBeTruthy();

      fireEvent.change(screen.getByRole("combobox"), {
         target: { value: "system" },
      });
      await waitFor(() => expect(screen.getByText("reduced")).toBeTruthy());

      fireEvent.change(screen.getByRole("combobox"), {
         target: { value: "full" },
      });
      await waitFor(() => expect(screen.getByText("full")).toBeTruthy());
      expect(
         globalThis.localStorage.getItem("portfolio-motion-preference"),
      ).toBe("full");
   });
});
