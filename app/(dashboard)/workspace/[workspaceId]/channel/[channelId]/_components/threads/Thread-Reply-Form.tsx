import { messageSchema, MessageSchemaType } from "@/app/schemas/messages";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { MessageComposer } from "../Messages/MessageComposer";
import { useAttachmentUpload } from "@/hooks/Use-attachment-upload";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { Message } from "@prisma/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/getAwatar";

interface ThreadReplyFormProps {
  threadId: string;
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadReplyForm({ threadId, user }: ThreadReplyFormProps) {
  const { channelId } = useParams<{
    channelId: string;
  }>();

  const upload = useAttachmentUpload();

  const [editorKey, setEditorKey] = useState(0);

  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      channelId: channelId,
      content: "",
      imageUrl: "",
      threadId: threadId,
    },
  });

  useEffect(() => {
    form.setValue("threadId", threadId);
  }, [threadId, form]);

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        const listOption = orpc.message.thread.list.queryOptions({
          input: {
            messageId: threadId,
          },
        });

        await queryClient.cancelQueries({ queryKey: listOption.queryKey });

        const previousData = queryClient.getQueryData(listOption.queryKey);

        const optimistic: Message = {
          id: `optimistic-${crypto.randomUUID()}`,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: data.channelId,
          threadId: threadId,
          imageUrl: data.imageUrl || null,
        };

        queryClient.setQueryData(listOption.queryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: [...old.messages, optimistic],
          };
        });

        return {
          listOption,
          previousData,
        };
      },

      onSuccess: (_data, _variables, ctx) => {
        queryClient.invalidateQueries({ queryKey: ctx.listOption.queryKey });

        form.reset({
          channelId: channelId,
          content: "",
          imageUrl: "",
          threadId,
        });

        upload.clearImage();

        setEditorKey((key) => key + 1);

        return toast.success("Message sent successfully");
      },
      onError: (_err, _vari, ctx) => {
        if (!ctx) return;

        const { listOption, previousData } = ctx;

        if (previousData) {
          queryClient.setQueryData(listOption.queryKey, previousData);
        }

        return toast.error("Failed to send message please try again later");
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
                  value={field.value}
                  onChange={field.onChange}
                  uplaod={upload}
                  key={editorKey}
                  onSubmit={() => onSubmit(form.getValues())}
                />
              </FormControl>
            </FormItem>
          )}
        />
        .
      </form>
    </Form>
  );
}
