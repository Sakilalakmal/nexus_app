import z from "zod";

export const messageSchema = z.object({
  chanellId: z.string(),
  content: z.string(),
  imageUrl: z.url().optional(),
});

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().optional(),
});

export type MessageSchemaType = z.infer<typeof messageSchema>;

export type UpdateMessageSchemaType = z.infer<typeof updateMessageSchema>;
