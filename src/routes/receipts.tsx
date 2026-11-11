import { createFileRoute, redirect } from "@tanstack/react-router";

// Receipts now lives inside the Rule Canvas side panel.
export const Route = createFileRoute("/receipts")({
  beforeLoad: () => { throw redirect({ to: "/canvas" }); },
});
