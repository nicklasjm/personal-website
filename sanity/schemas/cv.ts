import { defineField, defineType } from "sanity";

export const cv = defineType({
  name: "cv",
  title: "CV",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "jobTitle",
      title: "Job Title",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn URL",
      type: "url",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "array",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
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
                      rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
                  },
                ],
              },
            ],
          },
          lists: [],
        },
      ],
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "experience",
      title: "Experience",
      type: "array",
      of: [
        {
          type: "object",
          name: "job",
          fields: [
            defineField({
              name: "company",
              title: "Company",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "role",
              title: "Role",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "location",
              title: "Location",
              type: "string",
            }),
            defineField({
              name: "startDate",
              title: "Start Date",
              type: "date",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "endDate",
              title: "End Date",
              type: "date",
            }),
            defineField({
              name: "current",
              title: "Current Position",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "array",
              of: [
                {
                  type: "block",
                  styles: [{ title: "Normal", value: "normal" }],
                  marks: {
                    decorators: [
                      { title: "Bold", value: "strong" },
                      { title: "Italic", value: "em" },
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
                              rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
                          },
                        ],
                      },
                    ],
                  },
                  lists: [
                    { title: "Bullet", value: "bullet" },
                  ],
                },
              ],
            }),
            defineField({
              name: "highlights",
              title: "Highlights",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: {
            select: {
              title: "role",
              subtitle: "company",
            },
          },
        },
      ],
    }),
    defineField({
      name: "education",
      title: "Education",
      type: "array",
      of: [
        {
          type: "object",
          name: "edu",
          fields: [
            defineField({
              name: "institution",
              title: "Institution",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "degree",
              title: "Degree",
              type: "string",
            }),
            defineField({
              name: "field",
              title: "Field of Study",
              type: "string",
            }),
            defineField({
              name: "startDate",
              title: "Start Date",
              type: "date",
            }),
            defineField({
              name: "endDate",
              title: "End Date",
              type: "date",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "array",
              of: [
                {
                  type: "block",
                  styles: [{ title: "Normal", value: "normal" }],
                  marks: {
                    decorators: [
                      { title: "Bold", value: "strong" },
                      { title: "Italic", value: "em" },
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
                              rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
                          },
                        ],
                      },
                    ],
                  },
                  lists: [
                    { title: "Bullet", value: "bullet" },
                  ],
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: "degree",
              subtitle: "institution",
            },
          },
        },
      ],
    }),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      of: [
        {
          type: "object",
          name: "skillGroup",
          fields: [
            defineField({
              name: "category",
              title: "Category",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: {
            select: { title: "category" },
          },
        },
      ],
    }),
    defineField({
      name: "tools",
      title: "Tools",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "languages",
      title: "Languages",
      type: "array",
      of: [
        {
          type: "object",
          name: "lang",
          fields: [
            defineField({
              name: "language",
              title: "Language",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "proficiency",
              title: "Proficiency",
              type: "string",
              options: {
                list: [
                  { title: "Native", value: "native" },
                  { title: "Fluent", value: "fluent" },
                  { title: "Professional", value: "professional" },
                  { title: "Conversational", value: "conversational" },
                  { title: "Basic", value: "basic" },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: "language",
              subtitle: "proficiency",
            },
          },
        },
      ],
    }),
    defineField({
      name: "sideProjects",
      title: "Side Projects",
      type: "array",
      of: [
        {
          type: "object",
          name: "sideProject",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "array",
              of: [
                {
                  type: "block",
                  styles: [{ title: "Normal", value: "normal" }],
                  marks: {
                    decorators: [
                      { title: "Bold", value: "strong" },
                      { title: "Italic", value: "em" },
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
                              rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
                          },
                        ],
                      },
                    ],
                  },
                  lists: [
                    { title: "Bullet", value: "bullet" },
                  ],
                },
              ],
            }),
            defineField({
              name: "year",
              title: "Year",
              type: "string",
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "year",
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
