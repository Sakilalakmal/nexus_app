import { z } from "zod";

export const inviteMemberSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be at most 100 characters long"),
  email: z.email("Invalid email address"),
});

export type InviteMemberSchemaType = z.infer<typeof inviteMemberSchema>;
