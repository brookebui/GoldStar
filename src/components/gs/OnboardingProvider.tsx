import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { readOnboardingDone, tourSteps, writeOnboardingDone } from "@/data/onboarding";

export type OnboardingPhase = "welcome" | "tour" | "done";

type OnboardingContext = {
  phase: OnboardingPhase;
  step: number;
  startTour: () => void;
  skip: () => void;
  dismissWelcome: () => void;
  next: () => void;
  back: () => void;
};

const Context = createContext<OnboardingContext | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<OnboardingPhase>(() => (readOnboardingDone() ? "done" : "welcome"));
  const [step, setStep] = useState(0);
  const value = useMemo<OnboardingContext>(() => ({
    phase,
    step,
    startTour: () => { setStep(0); setPhase("tour"); },
    skip: () => { writeOnboardingDone(); setPhase("done"); },
    dismissWelcome: () => {
      setPhase((current) => {
        if (current !== "welcome") return current;
        writeOnboardingDone();
        return "done";
      });
    },
    next: () => {
      if (step >= tourSteps.length - 1) { writeOnboardingDone(); setPhase("done"); return; }
      setStep((current) => current + 1);
    },
    back: () => setStep((current) => Math.max(0, current - 1)),
  }), [phase, step]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useOnboarding() {
  const context = useContext(Context);
  if (!context) throw new Error("useOnboarding needs OnboardingProvider");
  return context;
}
