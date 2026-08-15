import { createFileRoute } from "@tanstack/react-router";
import { DesignWizard } from "@/components/engineering/DesignWizard";

export const Route = createFileRoute("/extension-panel")({
  head: () => ({
    meta: [
      { title: "Extension Panel Design — ELEXORA" },
      { name: "description", content: "Engineer extension panels for existing switchgear boards with matched busbars and feeders." },
      { property: "og:title", content: "Extension Panel Design — ELEXORA" },
      { property: "og:description", content: "Engineer extension panels for existing switchgear boards with matched busbars and feeders." },
    ],
  }),
  component: () => <DesignWizard module="EXTENSION" />,
});
