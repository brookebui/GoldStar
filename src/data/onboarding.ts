export const ONBOARDING_KEY = "gs-onboarding";

export type TourStep = {
  id: string;
  route: "/" | "/canvas";
  title: string;
  body: string;
};

export const tourSteps: TourStep[] = [
  {
    id: "inbox-list",
    route: "/",
    title: "Proposed Rules",
    body: "Gold Star groups repeated corrections into rules you can review here before they reach any project.",
  },
  {
    id: "inbox-detail",
    route: "/",
    title: "Read, then accept",
    body: "Open a rule to see the proposed markdown and the traces behind it. Accepting it sends it to the projects you choose.",
  },
  {
    id: "nav-constellations",
    route: "/",
    title: "Constellations",
    body: "This is the map of how rules reach projects. Open it when you want to attach, detach, or see scope at a glance.",
  },
  {
    id: "rules-view",
    route: "/canvas",
    title: "Canvas or List",
    body: "Canvas is the constellation map. List is the same rules in a table. Switch anytime — filters stay in sync.",
  },
  {
    id: "canvas-surface",
    route: "/canvas",
    title: "Attach rules to projects",
    body: "Drag a rule’s star onto a project or onto Global to attach it. Click a dashed wire to detach it.",
  },
];

export function readOnboardingDone() {
  try {
    return sessionStorage.getItem(ONBOARDING_KEY) === "done";
  } catch {
    return false;
  }
}

export function writeOnboardingDone() {
  try {
    sessionStorage.setItem(ONBOARDING_KEY, "done");
  } catch {
    /* private mode */
  }
}
