import { glob, file } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const supportedLanguages = [
  "JavaScript",
  "Typescript",
  "Python",
  "Golang",
  "PHP",
  "JSON",
  "markdown",
  "Rust",
];

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

const projects = defineCollection({
  loader: file("./src/data/projects.yaml"),
  schema: z.object({
    title: z.string(),
    created: z.coerce.number(),
    type: z.enum(["package", "tool", "webapp", "json-schema"]),
    description: z.string(),
    status: z.enum(["wip", "active", "archived"]),
    lang: z.array(z.enum(supportedLanguages)),
    tags: z.array(z.string()),
    url: z.string().url(),
  }),
});

const contributions = defineCollection({
  loader: file("./src/data/contributions.yaml"),
  schema: z.object({
    title: z.string(),
    lang: z.array(z.enum(supportedLanguages)),
    prs: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      })
    ),
    url: z.string().url(),
  }),
});

const hobbies = defineCollection({
  loader: glob({ base: "./src/content/hobbies", pattern: "**/info.md" }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string(),
      cover: image(),
    }),
});

export const collections = { blog, hobbies, projects, contributions };
