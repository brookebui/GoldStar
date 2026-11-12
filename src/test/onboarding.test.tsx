import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingProvider } from "@/components/gs/OnboardingProvider";
import { WelcomeDialog } from "@/components/gs/WelcomeDialog";
import { TourOverlay } from "@/components/gs/TourOverlay";
import { ONBOARDING_KEY } from "@/data/onboarding";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
beforeEach(() => sessionStorage.clear());

function Harness() {
  return (
    <OnboardingProvider>
      <WelcomeDialog />
      <TourOverlay onNavigate={vi.fn()} />
      <div data-tour="inbox-list">Inbox list</div>
    </OnboardingProvider>
  );
}

describe("Onboarding welcome", () => {
  it("shows the welcome dialog when onboarding is unset", () => {
    render(<Harness />);
    expect(screen.getByRole("heading", { name: "Turn your corrections into lasting rules." })).toBeTruthy();
    expect(screen.getByText("You've got a new sidekick!")).toBeTruthy();
  });

  it("hides the dialog and records skip", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(screen.queryByRole("heading", { name: "Turn your corrections into lasting rules." })).toBeNull();
    expect(sessionStorage.getItem(ONBOARDING_KEY)).toBe("done");
  });

  it("starts the tour on the first spotlight", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Start tour" }));
    expect(screen.getByRole("heading", { name: "Proposed Rules" })).toBeTruthy();
    expect(screen.getByText(/groups repeated corrections/)).toBeTruthy();
  });
});
