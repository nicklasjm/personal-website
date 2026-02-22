import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: "static",
  site: "https://nicklasjakobsen.dk",
  adapter: netlify(),
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
