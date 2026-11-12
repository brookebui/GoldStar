import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { WelcomeDialog } from "./WelcomeDialog";
import { TourOverlay } from "./TourOverlay";

export function OnboardingHost() {
  const navigate = useNavigate();
  const onNavigate = useCallback((to: "/" | "/canvas") => navigate({ to, search: {} }), [navigate]);
  return (
    <>
      <WelcomeDialog />
      <TourOverlay onNavigate={onNavigate} />
    </>
  );
}
