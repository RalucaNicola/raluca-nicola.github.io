import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const dataVisualization = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/data-visualization' }),
  schema: articleSchema,
});

const drawings = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/drawings' }),
  schema: articleSchema,
});

export const collections = { 'data-visualization': dataVisualization, drawings };
