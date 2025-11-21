import z from "zod";

export const messageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.url().optional(),
  threadId: z.string().optional(),
});

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().optional(),
});

export const toggleReactionSchema = z.object({
  messageId: z.string(),
  emoji: z.string().min(1),
});

export const groupedReactionsSchema = z.object({
  emoji: z.string(),
  count: z.number(),
  reactedByUser: z.boolean(),
});

export type MessageSchemaType = z.infer<typeof messageSchema>;

export type UpdateMessageSchemaType = z.infer<typeof updateMessageSchema>;

export type ToggleReactionSchemaType = z.infer<typeof toggleReactionSchema>;

export type GroupedReactionsSchemaType = z.infer<typeof groupedReactionsSchema>;
