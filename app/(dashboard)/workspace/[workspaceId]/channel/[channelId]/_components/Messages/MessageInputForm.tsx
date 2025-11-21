"use client";

import { messageSchema, MessageSchemaType } from "@/app/schemas/messages";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MessageComposer } from "./MessageComposer";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useState } from "react";
import { useAttachmentUpload } from "@/hooks/Use-attachment-upload";
import { Message } from "@prisma/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/getAwatar";
import { da } from "zod/v4/locales";

interface messageProps {
  channelId: string;
  user: KindeUser<Record<string, unknown>>;
}

type MessageInputFormProps = { items: Message[]; nextCursor?: string };

type inifiniteMessages = InfiniteData<MessageInputFormProps>;

export function MessageInputForm({ channelId, user }: messageProps) {
  const queryClient = useQueryClient();

  const [editorKey, setEditorKey] = useState(0);

  const upload = useAttachmentUpload();

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
      threadId: undefined,
    },
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        await queryClient.cancelQueries({
          queryKey: ["messages-list", channelId],
        });

        const previousData = queryClient.getQueryData<inifiniteMessages>([
          "messages-list",
          channelId,
        ]);

        const tempId = `optimistic-${crypto.randomUUID()}`;

        const optimisticMessage: Message = {
          id: tempId,
          content: data.content,
          imageUrl: data.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email as string,
          authorName: user.given_name as string,
          authorAvatar: getAvatar(user.picture as string | null, user.email!),
          channelId: channelId,
          threadId: null,
        };

        queryClient.setQueryData<inifiniteMessages>(
          ["messages-list", channelId],
          (old) => {
            if (!old) {
              return {
                pages: [
                  {
                    items: [optimisticMessage],
                    nextCursor: undefined,
                  },
                ],
                pageParams: [undefined],
              } satisfies inifiniteMessages;
            }

            const firstPages = old.pages[0] ?? {
              items: [],
              nextCursor: undefined,
            };

            const updatedFirstPage = {
              ...firstPages,
              items: [optimisticMessage, ...firstPages.items],
            };

            return {
              ...old,
              pages: [updatedFirstPage, ...old.pages.slice(1)],
            };
          }
        );

        return { previousData, tempId };
      },
      onSuccess: (data, _variables, context) => {
        queryClient.setQueryData<inifiniteMessages>(
          ["messages-list", channelId],
          (old) => {
            if (!old) return old;

            const updatedPages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === context.tempId
                  ? {
                      ...data,
                    }
                  : m
              ),
            }));

            return {
              ...old,
              pages: updatedPages,
            };
          }
        );

        form.reset({ channelId: channelId, content: "", threadId: undefined });
        setEditorKey((prev) => prev + 1);
        return toast.success("Message sent");
      },
      onError: (_err, _variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            ["messages-list", channelId],
            context.previousData
          );
        }

        return toast.error("Failed to send message, please try again.");
      },
    })
  );
  function onSubmit(data: MessageSchemaType) {
    createMessageMutation.mutate({
      ...data,
      imageUrl: upload.stageUrl ?? undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  key={editorKey}
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={() => onSubmit(form.getValues())}
                  isSending={createMessageMutation.isPending}
                  uplaod={upload}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
