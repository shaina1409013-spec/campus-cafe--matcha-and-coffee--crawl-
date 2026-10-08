import { createFileRoute, redirect } from "@tanstack/react-router";

// The team's frontend is plain HTML served from frontend/public/site.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/site/index.html" });
  },
  head: () => ({
    meta: [
      { title: "Campus Café — Matcha & Coffee Crawl" },
      { name: "description", content: "Find campus cafés, compare coffee prices and share reviews." },
      { property: "og:title", content: "Campus Café — Matcha & Coffee Crawl" },
      { property: "og:description", content: "Find campus cafés, compare coffee prices and share reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
