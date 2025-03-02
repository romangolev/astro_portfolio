import { defineCollection, z } from 'astro:content';

const projectCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    technologies: z.array(z.string()),
    image: z.string().optional(),
    github: z.string().optional(),
    demo: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    image: z.string().optional(),
  }),
});

export const collections = {
  'projects': projectCollection,
  'blog': blogCollection,
}; 