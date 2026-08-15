import { createFileRoute } from "@tanstack/react-router";
import { DesignWizard } from "@/components/engineering/DesignWizard";

export const Route = createFileRoute("/new-design")({
  head: () => ({
    meta: [
      { title: "New Feeder Design — ELEXORA" },
      { name: "description", content: "Rule-driven engineering of switchgear feeders with automatic BOM and schematic generation." },
      { property: "og:title", content: "New Feeder Design — ELEXORA" },
      { property: "og:description", content: "Rule-driven engineering of switchgear feeders with automatic BOM and schematic generation." },
    ],
  }),
  component: () => <DesignWizard module="NEW_DESIGN" />,
});
