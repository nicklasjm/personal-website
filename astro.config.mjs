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
      projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.PUBLIC_SANITY_DATASET || "production",
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
