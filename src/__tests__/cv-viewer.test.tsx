import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CvDocument from "@components/ui/CvViewerModal/CvDocument";
import { getUiCopy } from "@data/ui";

const copy = getUiCopy().cv;
const manifest = { pages: 1, width: 1200, height: 1600 };
const cv = {
   version: "v1",
   header: { name: "Test CV", tagline: [], links: [] },
   sections: [],
};

function renderViewer(web: Response, pages: Response) {
   vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
      String(url).endsWith("/cv.json") ? web : pages,
   );
   render(<CvDocument isMobile={false} unavailable={<p>Unavailable</p>} />);
}

afterEach(() => vi.restoreAllMocks());

it("lets the PDF page grow beyond the viewer at both zoom-in steps", async () => {
   renderViewer(Response.json(cv), Response.json(manifest));
   fireEvent.click(screen.getByRole("button", { name: copy.view_pages }));
   const page = await screen.findByRole("img");
   const zoomIn = screen.getByRole("button", { name: copy.zoom_in });
   for (const width of ["125%", "150%"]) {
      fireEvent.click(zoomIn);
      expect(page.style.width).toBe(width);
      expect(page.style.maxWidth).toBe("none");
   }
});

it("returns to the working web CV when a PDF page image fails", async () => {
   renderViewer(Response.json(cv), Response.json(manifest));
   await screen.findByRole("article");
   fireEvent.click(screen.getByRole("button", { name: copy.view_pages }));
   fireEvent.error(await screen.findByRole("img"));
   expect((await screen.findByRole("article")).textContent).toContain(
      "Test CV",
   );
   expect(screen.queryByRole("button", { name: copy.view_pages })).toBeNull();
});

it("keeps the PDF usable when only the web CV fails", async () => {
   renderViewer(new Response(null, { status: 404 }), Response.json(manifest));
   expect(await screen.findByRole("img")).toBeTruthy();
   expect(screen.queryByRole("button", { name: copy.view_web })).toBeNull();
});

it("shows the download fallback when both CV sources fail", async () => {
   renderViewer(
      new Response(null, { status: 404 }),
      new Response(null, { status: 404 }),
   );
   expect(await screen.findByText("Unavailable")).toBeTruthy();
});
