import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MotionPreferenceProvider } from "@hooks/MotionPreferenceProvider";
import ContributionCalendar from "@pages/stats/ContributionCalendar";

afterEach(() => vi.unstubAllGlobals());

const renderYear = (username: string) => {
   const start = Date.UTC(2025, 10, 19);
   const contributions = Array.from({ length: 365 }, (_, index) => ({
      date: new Date(start + index * 86_400_000).toISOString().slice(0, 10),
      count: index % 7,
   }));
   vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ contributions })),
   );
   return render(
      <MotionPreferenceProvider>
         <ContributionCalendar username={username} />
      </MotionPreferenceProvider>,
   );
};

it("lets a keyboard visitor choose a day, read its count and reveal it in the heatmap", async () => {
   const { container } = renderYear("calendar-keyboard");
   const picker = await screen.findByRole<HTMLSelectElement>("combobox", {
      name: /daily github contributions/i,
   });
   const count = screen.getByRole("status");
   const options = within(picker).getAllByRole("option");
   expect(options).toHaveLength(365);
   expect(options[0].textContent).toBe("Nov 18, 2026");
   expect(options.at(-1)?.textContent).toBe("Nov 19, 2025");
   expect(picker.selectedOptions[0]).toBe(options[0]);
   expect(count.textContent).toBe("No contributions");

   const scroller = container.querySelector<HTMLElement>(".cal-scroller")!;
   const firstDay = container.querySelector<HTMLElement>('[data-i="0"]')!;
   scroller.scrollLeft = 200;
   vi.spyOn(scroller, "getBoundingClientRect").mockReturnValue(
      new DOMRect(100, 0, 160, 120),
   );
   vi.spyOn(firstDay, "getBoundingClientRect").mockReturnValue(
      new DOMRect(-100, 20, 11, 11),
   );
   picker.focus();
   // Native keyboard selection raises change on the same single tab stop.
   fireEvent.change(picker, { target: { value: "0" } });
   expect(document.activeElement).toBe(picker);
   expect(count.textContent).toBe("No contributions");
   expect(firstDay.hasAttribute("data-selected")).toBe(true);
   expect(scroller.scrollLeft).toBeLessThan(200);

   fireEvent.change(picker, { target: { value: "1" } });
   expect(count.textContent).toBe("1 contribution");
   expect(firstDay.hasAttribute("data-selected")).toBe(false);
});

it("keeps hover and touch tips independent of the selected day", async () => {
   const { container } = renderYear("calendar-pointer");
   await screen.findByRole("combobox");
   const day = container.querySelector<HTMLElement>('[data-i="3"]')!;
   const grid = container.querySelector<HTMLElement>(".cal-grid")!;
   const scroller = container.querySelector<HTMLElement>(".cal-scroller")!;
   scroller.scrollLeft = 42;

   fireEvent.pointerMove(day, { pointerType: "mouse" });
   const tip = "3 contributions on Nov 22, 2025";
   expect(screen.getByText(tip)).toBeTruthy();
   fireEvent.pointerLeave(grid, { pointerType: "mouse" });
   expect(screen.queryByText(tip)).toBeNull();

   fireEvent.pointerDown(day, { pointerType: "touch" });
   fireEvent.click(day);
   expect(screen.getByText(tip)).toBeTruthy();
   fireEvent.click(day);
   expect(screen.queryByText(tip)).toBeNull();
   expect(screen.getByRole("status").textContent).toBe("No contributions");
   expect(scroller.scrollLeft).toBe(42);
});
