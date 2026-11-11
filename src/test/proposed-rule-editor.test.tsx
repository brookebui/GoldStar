import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProposedRuleEditor } from "@/components/gs/ProposedRuleEditor";

afterEach(cleanup);
const original = "# Use spacing tokens\n\nUse the 4px scale.";

describe("Proposed rule editing", () => {
  it("commits edited Markdown only when Save is chosen", () => {
    const onSave = vi.fn();
    render(<ProposedRuleEditor markdown={original} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Rule markdown" }), { target: { value: "# Updated rule\n\nUse spacing tokens." } });
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /^Save$/ }));
    expect(onSave).toHaveBeenCalledExactlyOnceWith("# Updated rule\n\nUse spacing tokens.");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("textbox", { name: "Rule markdown" })).toHaveValue("# Updated rule\n\nUse spacing tokens.");
  });

  it("discards edits on Cancel without changing the saved rule", () => {
    const onSave = vi.fn();
    render(<ProposedRuleEditor markdown={original} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Rule markdown" }), { target: { value: "# Discard me" } });
    fireEvent.click(screen.getByRole("button", { name: /^Cancel$/ }));
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("textbox", { name: "Rule markdown" })).toHaveValue(original);
  });

  it("copies raw saved Markdown in View and current draft Markdown in Edit", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<ProposedRuleEditor markdown={original} onSave={vi.fn()} />);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Copy" })); });
    expect(writeText).toHaveBeenLastCalledWith(original);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Rule markdown" }), { target: { value: "## Unsaved draft" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Copy" })); });
    expect(writeText).toHaveBeenLastCalledWith("## Unsaved draft");
  });
});