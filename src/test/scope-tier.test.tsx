import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ScopeTier } from "@/components/gs/ScopeTier";

afterEach(cleanup);

describe("Scope tier display", () => {
  it("names only Global for a rule that is in the global scope", () => {
    render(<ScopeTier scopeType="global" />);
    expect(screen.getByText("Global")).toBeTruthy();
    expect(screen.queryByText("Local")).toBeNull();
  });

  it("names only Local for a rule that is in one project", () => {
    render(<ScopeTier scopeType="local" />);
    expect(screen.getByText("Local")).toBeTruthy();
    expect(screen.queryByText("Global")).toBeNull();
  });

  it("offers nothing to click between", () => {
    const { container } = render(<ScopeTier scopeType="global" />);
    expect(container.querySelector("button")).toBeNull();
  });
});
