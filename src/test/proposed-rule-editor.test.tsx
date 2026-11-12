import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

  it("opens the share dialog with saved Markdown in View and current draft Markdown in Edit", async () => {
    render(<ProposedRuleEditor markdown={original} onSave={vi.fn()} rule={{ id: "spacing", name: "Spacing rule" }} />);
    fireEvent.click(screen.getByRole("button", { name: /Share/i }));
    const viewDialog = screen.getByRole("dialog");
    expect(within(viewDialog).getByRole("heading", { name: "Share rule" })).toBeTruthy();
    expect(within(viewDialog).getByText(/Use spacing tokens/)).toBeTruthy();
    fireEvent.click(within(viewDialog).getByRole("button", { name: "Close" }));

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Rule markdown" }), { target: { value: "## Unsaved draft\n\nScale 8px." } });
    fireEvent.click(screen.getByRole("button", { name: /Share/i }));
    const editDialog = screen.getByRole("dialog");
    expect(within(editDialog).getByRole("heading", { name: "Share rule" })).toBeTruthy();
    expect(within(editDialog).getByText(/Unsaved draft/)).toBeTruthy();
  });
});