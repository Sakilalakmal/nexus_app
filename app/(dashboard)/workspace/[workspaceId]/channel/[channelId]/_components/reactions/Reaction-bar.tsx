import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { EmojiReactionPicker } from "./Emoji-reaction";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { GroupedReactionsSchemaType } from "@/app/schemas/messages";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { MessageListItem } from "@/lib/type";

type ThreadContext = { type: "thread"; threadId: string };
type ListContext = { type: "list"; channelId: string };

interface ReactionBarProps {
  messageId: string;
  reactions?: GroupedReactionsSchemaType[];
  context?: ThreadContext | ListContext;
}

type MessagePage = {
  items: MessageListItem[];
  nextCursor?: string;
};

type InfiniteReplies = InfiniteData<MessagePage>;

export function ReactionBar({
  messageId,
  reactions,
  context,
}: ReactionBarProps) {
  const { channelId } = useParams<{ channelId: string }>();

  const queryClient = useQueryClient();

  const mutation = useMutation(
    orpc.message.reaction.toggle.mutationOptions({
      onMutate: async (vars: { messageId: string; emoji: string }) => {
        // Update reactions optimistically ( prevent dry )
        const bums = (rns: GroupedReactionsSchemaType[]) => {
          const found = rns.find((r) => r.emoji === vars.emoji);

          if (found) {
            const dec = found.count - 1;

            return dec <= 0
              ? rns.filter((r) => r.emoji !== found.emoji)
              : rns.map((r) =>
                  r.emoji === found.emoji
                    ? {
                        ...r,
                        count: dec,
                        reactedByUser: false,
                      }
                    : r
                );
          }

          return [...rns, { emoji: vars.emoji, count: 1, reactedByUser: true }];
        };

        const isThread = context && context.type === "thread";

        if (isThread) {
          const listOptions = orpc.message.thread.list.queryOptions({
            input: { messageId: context.threadId },
          });

          await queryClient.cancelQueries({ queryKey: listOptions.queryKey });
          const previousThreadData = queryClient.getQueryData(
            listOptions.queryKey
          );

          queryClient.setQueryData(listOptions.queryKey, (old) => {
            if (!old) return old;

            if (vars.messageId === context.threadId) {
              return {
                ...old,
                parent: {
                  ...old.parent,
                  reactions: bums(old.parent.reactions || []),
                },
              };
            }

            return {
              ...old,
              messages: old.messages.map((m) =>
                m.id !== vars.messageId
                  ? m
                  : { ...m, reactions: bums(m.reactions || []) }
              ),
            };
          });

          return {
            previousThreadData,
            threadQueryKey: listOptions.queryKey,
          };
        }

        const listKey = ["messages-list", channelId];
        await queryClient.cancelQueries({ queryKey: listKey });
        const previousData = queryClient.getQueryData(listKey);

        queryClient.setQueryData<InfiniteReplies>(listKey, (old) => {
          if (!old) return old;

          const pages = old.pages.map((page) => ({
            ...page,
            items: page.items.map((m) => {
              if (m.id !== messageId) return m;

              const current = m.reactions || [];

              return {
                ...m,
                reactions: bums(current),
              };
            }),
          }));

          return {
            ...old,
            pages,
          };
        });

        return {
          previousData,
          listKey,
        };
      },

      onSuccess: () => {
        return toast.success("Reaction added");
      },
      onError: (_err, _variables, ctx) => {
        if (ctx?.previousData && ctx?.listKey) {
          queryClient.setQueryData(ctx.listKey, ctx.previousData);
        }

        return toast.error("Failed to add reaction");
      },
    })
  );

  const handleToggle = (emoji: string) => {
    mutation.mutate({
      messageId: messageId,
      emoji: emoji,
    });
  };

  return (
    <div className="mt-1 flex items-center gap-1">
      {reactions?.map((r) => (
        <Button
          key={r.emoji}
          type="button"
          variant={"secondary"}
          size={"icon"}
          onClick={() => handleToggle(r.emoji)}
          className={cn(
            "h-6 px-2 text-xs",
            r.reactedByUser &&
              "bg-primary/50 text-primary-foreground border border-primary"
          )}
        >
          <span>
            {r.emoji} {r.count}
          </span>
        </Button>
      ))}
      <EmojiReactionPicker onSelectEmoji={handleToggle} />
    </div>
  );
}
