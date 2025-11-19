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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useState } from "react";
import { useAttachmentUpload } from "@/hooks/Use-attachment-upload";

interface messageProps {
  channelId: string;
}

export function MessageInputForm({ channelId }: messageProps) {
  const queryClient = useQueryClient();

  const [editorKey, setEditorKey] = useState(0);

  const upload = useAttachmentUpload();

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      chanellId: channelId,
    },
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key(),
        });

        form.reset({ chanellId: channelId, content: "" });

        upload.clearImage();

        setEditorKey((prev) => prev + 1);

        return toast.success("Message sent");
      },
      onError: () => {
        return toast.error("Failed to send message");
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
