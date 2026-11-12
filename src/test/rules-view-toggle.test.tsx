import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RulesViewToggle } from "@/components/gs/RulesViewToggle";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { search?: unknown; to?: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("RulesViewToggle", () => {
  it("renders horizontal slider toggle when expanded with canvas active", () => {
    const { container } = render(<RulesViewToggle view="canvas" collapsed={false} />);
    const group = screen.getByRole("group", { name: "Rules view" });
    expect(group.className).toContain("w-full");
    expect(group.className).toContain("h-8");

    const canvasLink = screen.getByLabelText("Canvas view");
    const listLink = screen.getByLabelText("List view");
    expect(canvasLink.getAttribute("aria-pressed")).toBe("true");
    expect(listLink.getAttribute("aria-pressed")).toBe("false");

    const indicator = container.querySelector("span[aria-hidden='true']") as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(0px)");
  });

  it("renders horizontal slider toggle with list active indicator translated", () => {
    const { container } = render(<RulesViewToggle view="list" collapsed={false} />);
    const canvasLink = screen.getByLabelText("Canvas view");
    const listLink = screen.getByLabelText("List view");
    expect(canvasLink.getAttribute("aria-pressed")).toBe("false");
    expect(listLink.getAttribute("aria-pressed")).toBe("true");

    const indicator = container.querySelector("span[aria-hidden='true']") as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(100%)");
  });

  it("renders compressed vertical slider toggle when collapsed with canvas active", () => {
    const { container } = render(<RulesViewToggle view="canvas" collapsed={true} />);
    const group = screen.getByRole("group", { name: "Rules view" });
    expect(group.className).toContain("w-8");
    expect(group.className).toContain("flex-col");

    const canvasLink = screen.getByLabelText("Canvas view");
    const listLink = screen.getByLabelText("List view");
    expect(canvasLink.getAttribute("aria-pressed")).toBe("true");
    expect(listLink.getAttribute("aria-pressed")).toBe("false");

    const indicator = container.querySelector("span[aria-hidden='true']") as HTMLElement;
    expect(indicator.style.transform).toBe("translateY(0px)");
  });

  it("renders compressed vertical slider toggle with list active indicator translated vertically", () => {
    const { container } = render(<RulesViewToggle view="list" collapsed={true} />);
    const canvasLink = screen.getByLabelText("Canvas view");
    const listLink = screen.getByLabelText("List view");
    expect(canvasLink.getAttribute("aria-pressed")).toBe("false");
    expect(listLink.getAttribute("aria-pressed")).toBe("true");

    const indicator = container.querySelector("span[aria-hidden='true']") as HTMLElement;
    expect(indicator.style.transform).toBe("translateY(32px)");
  });
});
