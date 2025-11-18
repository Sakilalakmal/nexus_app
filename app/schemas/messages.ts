import z from "zod";

export const messageSchema = z.object({
  chanellId: z.string(),
  content: z.string(),
  imageUrl: z.url().optional(),
});

export type MessageSchemaType = z.infer<typeof messageSchema>;
