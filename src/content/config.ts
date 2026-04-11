import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    categories: z.string().optional(),
    headerImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const reviewsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    type: z.enum(['movie', 'book', 'game', 'tv', 'boardgame', 'other']),
    rating: z.number().int().min(1).max(5),
    externalUrl: z.string().url().optional(),
    headerImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts: postsCollection,
  reviews: reviewsCollection,
};
