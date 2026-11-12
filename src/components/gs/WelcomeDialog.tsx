import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "./OnboardingProvider";
import welcomeHero from "@/assets/welcome-hero.jpg";
import { Star } from "./Star";

export function WelcomeDialog() {
  const { phase, startTour, skip, dismissWelcome } = useOnboarding();
  return (
    <Dialog open={phase === "welcome"} onOpenChange={(open) => { if (!open) dismissWelcome(); }}>
      <DialogPortal>
        <DialogOverlay className="bg-black/75 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(48rem,calc(100vw-2rem))] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl border border-gold/25 bg-[#130D11] p-0 shadow-lift outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="relative min-h-[22rem] sm:min-h-[25rem] overflow-hidden">
            <img
              src={welcomeHero}
              alt=""
              className="pointer-events-none absolute inset-y-0 right-0 h-full w-full object-cover object-right translate-x-6 sm:translate-x-12 md:translate-x-18"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#130D11] via-[#130D11]/80 via-42% to-transparent" />
            <div className="relative flex min-h-[22rem] sm:min-h-[25rem] max-w-[24rem] sm:max-w-[28rem] flex-col justify-center p-6 sm:p-9">
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gold">
                <Star className="size-3.5 shrink-0" />
                <span>You've got a new sidekick!</span>
              </div>
              <DialogTitle className="gs-section-title mt-2 text-left text-white text-2xl sm:text-[28px] font-normal leading-tight">
                Turn your corrections into lasting rules.
              </DialogTitle>
              <DialogDescription className="mt-3 text-left text-sm leading-relaxed text-white/80">
                Gold Star learns from AI agent traces to create reusable rules, helping your team stay consistent across projects.
              </DialogDescription>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button onClick={startTour}>Start tour</Button>
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={skip}>Skip</Button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
