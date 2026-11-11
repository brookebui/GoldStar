import { createFileRoute } from "@tanstack/react-router";
import { Proposals } from "@/components/gs/Proposals";

export const Route = createFileRoute("/proposals")({
  head: () => ({
    meta: [
      { title: "Proposals — Gold Star" },
      { name: "description", content: "Spot new patterns your agents keep inventing and propose them to the design system." },
      { property: "og:title", content: "Proposals — Gold Star" },
      { property: "og:description", content: "Emerging patterns that could become part of your design system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Proposals,
});
