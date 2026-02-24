import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Work", value: "work" },
          { title: "Playground", value: "playground" },
          { title: "Thoughts", value: "thoughts" },
          { title: "Links", value: "links" },
          { title: "Photography", value: "photography" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "featuredVideo",
      title: "Featured Video",
      type: "file",
      options: {
        accept: "video/mp4,video/webm",
      },
    }),
    defineField({
      name: "videoPoster",
      title: "Video Poster",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "cardLayout",
      title: "Card Layout",
      type: "string",
      description: "How this post appears in the feed",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "default",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (rule) =>
                      rule.uri({
                        scheme: ["http", "https", "mailto"],
                      }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
        {
          type: "object",
          name: "videoEmbed",
          title: "Video",
          fields: [
            defineField({
              name: "video",
              title: "Video File",
              type: "file",
              options: { accept: "video/mp4,video/webm" },
            }),
            defineField({
              name: "poster",
              title: "Poster Image",
              type: "image",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
        {
          type: "object",
          name: "gallery",
          title: "Image Gallery",
          fields: [
            defineField({
              name: "images",
              title: "Images",
              type: "array",
              of: [
                {
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    defineField({
                      name: "alt",
                      title: "Alt Text",
                      type: "string",
                    }),
                    defineField({
                      name: "caption",
                      title: "Caption",
                      type: "string",
                    }),
                  ],
                },
              ],
            }),
            defineField({
              name: "layout",
              title: "Layout",
              type: "string",
              options: {
                list: [
                  { title: "Grid", value: "grid" },
                  { title: "Carousel", value: "carousel" },
                ],
              },
              initialValue: "grid",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "externalLink",
      title: "External Link",
      type: "url",
      description: "Link to external case study or project",
    }),
  ],
  orderings: [
    {
      title: "Published Date, New",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "featuredImage",
      category: "category",
      date: "publishedAt",
    },
    prepare({ title, media, category, date }) {
      return {
        title,
        media,
        subtitle: `${category} — ${date ? new Date(date).toLocaleDateString() : "No date"}`,
      };
    },
  },
});
