import { z } from "zod";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import prisma from "@/lib/prismaClient";
import { jsonToMarkdown } from "@/lib/Json-markdown";
import { streamText } from "ai";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamToEventIterator } from "@orpc/server";

const openrouter = createOpenRouter({
  apiKey: process.env.LLM_KEY!,
});

const MODEL_ID = "z-ai/glm-4.5-air:free";

const model = openrouter.chat(MODEL_ID);

export const generateThreadSummary = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: "GET",
    path: "/ai/threads/summary",
    summary: "Generate thread summary using AI",
    tags: ["AI"],
  })
  .input(
    z.object({
      messageId: z.string(),
    })
  )
  .handler(async ({ input, errors, context }) => {
    const baseMessage = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        threadId: true,
        channelId: true,
      },
    });

    if (!baseMessage) {
      throw errors.NOT_FOUND();
    }

    const parentId = baseMessage.threadId ?? baseMessage.id;

    const parent = await prisma.message.findFirst({
      where: {
        id: parentId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        content: true,
        authorName: true,
        createdAt: true,
        replies: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            authorName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!parent) {
      throw errors.NOT_FOUND();
    }

    const replies = parent.replies.slice().reverse();

    const parentText = await jsonToMarkdown(parent.content);

    const lines = [];

    lines.push(
      `Thread Root - ${parent.authorName} - ${parent.createdAt.toDateString()}`
    );

    lines.push(parentText);

    if (replies.length > 0) {
      lines.push("\nReplies");
      for (const reply of replies) {
        const t = await jsonToMarkdown(reply.content);
        lines.push(
          `- ${reply.authorName} - ${reply.createdAt.toDateString()}\n${t}`
        );
      }
    }

    const compiled = lines.join("\n");

    const system = [
      "You are an expert assistant tasked with summarizing message threads for users in a professional and concise manner. When generating a summary, focus only on the content and main ideas discussed. Do not include or reference any user names, author names, or message timestamps",
      "Your summary must:",
      "Be clear, neutral, and suitable for any audience.",
      "Use bullet points or numbered lists for readability",
      "Highlight key points, decisions, and important information.",
      " Avoid personal opinions, speculation, or unnecessary details.",
      "Present the information in a factual and organized way",
    ].join(" \n");

    const result = streamText({
      model,
      system,
      messages: [{ role: "user", content: compiled }],
      temperature: 0.2,
    });

    return streamToEventIterator(result.toUIMessageStream());
  });
