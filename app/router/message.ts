import { z } from "zod";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { writeSecurityMiddleware } from "../middlewares/arcjet/write";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import prisma from "@/lib/prismaClient";
import { messageSchema } from "../schemas/messages";
import { getAvatar } from "@/lib/getAwatar";
import { Message } from "@/lib/generated/prisma/client";

export const createMessage = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: "POST",
    path: "/messages",
    summary: "Create a new message in a channel",
    description:
      "This endpoint allows an authenticated user to create a new message within a specified channel in the workspace.",
    tags: ["Messages"],
  })
  .input(messageSchema)
  .output(z.custom<Message>())
  .handler(async ({ input, context, errors }) => {
    //verufy channel belongs to workspace

    const channel = await prisma.channel.findFirst({
      where: {
        id: input.chanellId,
        workspaceId: context.workspace.orgCode,
      },
    });

    if (!channel) {
      throw errors.FORBIDDEN();
    }

    const createMessage = await prisma.message.create({
      data: {
        content: input.content,
        imageUrl: input.imageUrl,
        channelId: input.chanellId,
        authorId: context.user.id,
        authorEmail: context.user.email!,
        authorName: context.user.given_name ?? "",
        authorAvatar: getAvatar(context.user.picture, context.user.email!),
      },
    });

    return {
      ...createMessage,
    };
  });
