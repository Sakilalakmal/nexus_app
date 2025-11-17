import { z } from "zod";

export function transformChannelName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, "") // Remove special characters, keep only letters, numbers, and dashes
    .replace(/-+/g, "-") // Replace multiple consecutive dashes with single dash
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing dashes
}

export const channelNameSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters long")
    .max(70, "Channel name must be at most 70 characters long")
    .transform((name, ctx) => {
      const transformedName = transformChannelName(name);
      if (transformedName.length < 2) {
        ctx.addIssue({
          code: "custom",
          message:
            "Channel name must contain at least 2 alphanumeric characters after transformation",
        });
        return z.NEVER;
      }

      return transformedName;
    }),
});

export type ChannelNameSchemaType = z.infer<typeof channelNameSchema>;
