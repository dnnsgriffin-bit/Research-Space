import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evidence Studio — Check what your training data can prove" },
      {
        name: "description",
        content:
          "A two-minute evidence check for L&D teams. See which training claims your data supports, what might be getting in the way, and a suggested next step for evidence.",
      },
      {
        property: "og:title",
        content: "Evidence Studio — Check what your training data can prove",
      },
      {
        property: "og:description",
        content: "Before you report training impact, check what you can prove. Free preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});
