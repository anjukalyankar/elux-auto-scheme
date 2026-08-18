import { createFileRoute } from "@tanstack/react-router";
import { SimpleBomPage } from "@/components/engineering/SimpleBomPage";

export const Route = createFileRoute("/new-design")({
  head: () => ({
    meta: [
      { title: "Generate BOM — ELEXORA" },
      { name: "description", content: "Enter basic feeder inputs and generate an engineering BOM." },
      { property: "og:title", content: "Generate BOM — ELEXORA" },
      { property: "og:description", content: "Basic feeder inputs to BOM generation." },
    ],
  }),
  component: SimpleBomPage,
});
