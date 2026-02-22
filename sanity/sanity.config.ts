import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { post } from "./schemas/post";
import { cv } from "./schemas/cv";
import { siteSettings } from "./schemas/settings";
import { contact } from "./schemas/contact";

export default defineConfig({
  name: "nicklasjakobsen",
  title: "Nicklas Jakobsen Portfolio",
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "ty04ghjg",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
              ),
            S.listItem()
              .title("Contact")
              .child(
                S.document().schemaType("contact").documentId("contact"),
              ),
            S.listItem()
              .title("CV")
              .child(S.document().schemaType("cv").documentId("cv")),
            S.divider(),
            S.documentTypeListItem("post").title("Posts"),
          ]),
    }),
  ],
  schema: {
    types: [post, cv, siteSettings, contact],
  },
});
