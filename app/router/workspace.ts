import { KindeOrganization, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { os } from "@orpc/server";
import z from "zod";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { base } from "../middlewares/base";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { workspaceSchema } from "../schemas/workspace";
import { Organizations, Users, init } from "@kinde/management-api-js";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { heavyWriteSecurityMiddleware } from "../middlewares/arcjet/heavy-weight";
import { readSecurityMiddleware } from "../middlewares/read";
import prisma from "@/lib/prismaClient";
import { Message } from "@prisma/client";
import { MessageListItem } from "@/lib/type";
import { groupFunctions } from "./message";

export const listWorkspaces = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: "GET",
    path: "/workspace",
    summary: "List Workspaces",
    tags: ["workspace"],
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string(),
        })
      ),
      user: z.custom<KindeUser<Record<string, unknown>>>(),
      currentWorkspace: z.custom<KindeOrganization<unknown>>(),
    })
  )
  .handler(async ({ context, errors }) => {
    const { getUserOrganizations } = getKindeServerSession();

    const organization = await getUserOrganizations();

    if (!organization) {
      throw errors.FORBIDDEN();
    }

    return {
      workspaces: organization?.orgs.map((org) => ({
        id: org.code,
        name: org.name ?? "My Workspace",
        avatar: org.name?.charAt(0).toUpperCase() ?? "M",
      })),
      user: context.user,
      currentWorkspace: context.workspace,
    };
  });

export const createWorkspaces = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(heavyWriteSecurityMiddleware)
  .route({
    method: "POST",
    path: "/workspace",
    summary: "create Workspaces",
    tags: ["workspace"],
  })
  .input(workspaceSchema)
  .output(
    z.object({
      orgCode: z.string(),
      workspaceName: z.string(),
    })
  )
  .handler(async ({ context, errors, input }) => {
    init();

    let data;

    try {
      data = await Organizations.createOrganization({
        requestBody: {
          name: input.name,
        },
      });
    } catch (error) {
      throw errors.FORBIDDEN();
    }

    if (!data.organization?.code) {
      throw errors.FORBIDDEN({
        message: "Org code is not defined",
      });
    }

    try {
      await Organizations.addOrganizationUsers({
        orgCode: data.organization.code,
        requestBody: {
          users: [
            {
              id: context.user.id,
              roles: ["admin"],
            },
          ],
        },
      });
    } catch (error) {
      throw errors.FORBIDDEN();
    }

    const { refreshTokens } = getKindeServerSession();

    await refreshTokens();

    return {
      orgCode: data.organization.code,
      workspaceName: input.name,
    };
  });

export const listReplies = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/messages/:messageId/thread",
    summary: "List Replies in a Thread",
    description:
      "Retrieves a paginated list of replies for a specific thread within a channel. Requires authentication and workspace context.",
    tags: ["Message"],
  })
  .input(z.object({ messageId: z.string() }))
  .output(
    z.object({
      parent: z.custom<MessageListItem>(),
      messages: z.array(z.custom<MessageListItem>()),
    })
  )
  .handler(async ({ context, input, errors }) => {
    const parentRow = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        messageReactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    if (!parentRow) {
      throw errors.NOT_FOUND();
    }

    //fetching all messages with replies
    const messagesWithReplies = await prisma.message.findMany({
      where: {
        threadId: input.messageId,
      },
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        messageReactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    const parent: MessageListItem = {
      id: parentRow.id,
      content: parentRow.content,
      imageUrl: parentRow.imageUrl,
      authorAvatar: parentRow.authorAvatar,
      authorEmail: parentRow.authorEmail,
      authorId: parentRow.authorId,
      authorName: parentRow.authorName,
      createdAt: parentRow.createdAt,
      updatedAt: parentRow.updatedAt,
      channelId: parentRow.channelId,
      threadId: parentRow.threadId,
      repliesCount: parentRow._count.replies,
      reactions: groupFunctions(
        context.user.id,
        parentRow.messageReactions.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        }))
      ),
    };

    const messages: MessageListItem[] = messagesWithReplies.map((m) => ({
      id: m.id,
      content: m.content,
      imageUrl: m.imageUrl,
      authorAvatar: m.authorAvatar,
      authorEmail: m.authorEmail,
      authorId: m.authorId,
      authorName: m.authorName,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      channelId: m.channelId,
      threadId: m.threadId,
      repliesCount: m._count.replies,
      reactions: groupFunctions(
        context.user.id,
        m.messageReactions.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        }))
      ),
    }));

    return {
      parent,
      messages,
    };
  });
