import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import sanity from "@sanity/astro";

export default defineConfig({
  output: "static",
  site: "https://nicklasjakobsen.dk",
  adapter: netlify(),
  integrations: [
    sanity({
      projectId: "ty04ghjg",
      dataset: "production",
      useCdn: true,
      studioBasePath: "/studio",
    }),
    react(),
  ],
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
