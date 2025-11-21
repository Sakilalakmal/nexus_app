import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { getAvatar } from "@/lib/getAwatar";
import { ImageLoadingCoordinatorType } from "@/hooks/use-image-loading-coordinator";
import Image from "next/image";
import { useCallback, useState } from "react";
import { MesssgeHoverToolBar } from "../ToolBar/Index";
import { EditMessage } from "../ToolBar/EditMessage";
import { MessageListItem } from "@/lib/type";
import { MessageSquare } from "lucide-react";
import { useThreadContext } from "@/providers/threadProvders";
import { orpc } from "@/lib/orpc";
import { useQueryClient } from "@tanstack/react-query";
import { ReactionBar } from "../reactions/Reaction-bar";

interface messagesProps {
  message: MessageListItem;
  imageLoadingCoordinator?: ImageLoadingCoordinatorType;
  currentUserId: string;
}

export function MessageItem({
  message,
  imageLoadingCoordinator,
  currentUserId,
}: messagesProps) {
  const [imageLoading, setImageLoading] = useState(!!message.imageUrl);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { openThread } = useThreadContext();

  const prefetchThread = useCallback(() => {
    const options = orpc.message.thread.list.queryOptions({
      input: {
        messageId: message.id,
      },
    });

    queryClient
      .prefetchQuery({
        ...options,
        staleTime: 60_000,
      })
      .catch(() => {});
  }, [message.id, queryClient]);

  const handleImageLoadStart = () => {
    if (message.imageUrl) {
      setImageLoading(true);
      imageLoadingCoordinator?.registerImageStart(message.id);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    imageLoadingCoordinator?.registerImageComplete(message.id);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    imageLoadingCoordinator?.registerImageError(message.id);
  };

  return (
    <div className="relative flex space-x-3 rounded-lg p-4 group hover:bg-muted/50">
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        alt="user avatar"
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />

      <div className="flex min-w-0 flex-1 flex-col space-y-1">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{message.authorName}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(message.createdAt)}{" "}
            {new Intl.DateTimeFormat("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }).format(message.createdAt)}
          </p>
        </div>

        {isEditing ? (
          <EditMessage
            message={message}
            onCancel={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <>
            <SafeContent
              content={JSON.parse(message.content)}
              className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
            />

            {message.imageUrl && (
              <div className="mt-4">
                {imageLoading && (
                  <div className="rounded-md bg-muted animate-pulse max-h-[300px] w-64 h-48 flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">
                      Loading image...
                    </div>
                  </div>
                )}
                {imageError ? (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 max-h-[300px] w-64 h-48 flex items-center justify-center">
                    <div className="text-destructive text-sm">
                      Failed to load image
                    </div>
                  </div>
                ) : (
                  <Image
                    src={message.imageUrl}
                    alt="message image"
                    width={512}
                    height={512}
                    className={`rounded-md max-h-[300px] w-auto object-contain transition-opacity duration-200 ${
                      imageLoading ? "opacity-0 absolute" : "opacity-100"
                    }`}
                    onLoadingComplete={handleImageLoad}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    onLoadStart={handleImageLoadStart}
                  />
                )}
              </div>
            )}

            {/* emoji reactions */}
            <ReactionBar
              messageId={message.id}
              reactions={message.reactions}
              context={{ type: "list", channelId: message.channelId }}
            />

            {message.repliesCount > 0 && (
              <button
                onMouseEnter={prefetchThread}
                onFocus={prefetchThread}
                onClick={() => openThread?.(message.id)}
                type="button"
                className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:cursor-pointer hover:text-primary"
              >
                <MessageSquare className="size-3.5" />
                <span>
                  {message.repliesCount}
                  {message.repliesCount === 1 ? " reply" : " replies"}
                </span>
                <span className="opacity-0 group-hover:opacity-100">
                  View Thread
                </span>
              </button>
            )}
          </>
        )}
      </div>

      <MesssgeHoverToolBar
        messageId={message.id}
        canEdit={message.authorId === currentUserId}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
