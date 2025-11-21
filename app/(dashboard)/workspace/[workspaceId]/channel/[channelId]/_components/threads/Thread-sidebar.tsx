import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import Image from "next/image";
import { ThreadReplies } from "./Thread-Reply";
import { ThreadReplyForm } from "./Thread-Reply-Form";
import { useThreadContext } from "@/providers/threadProvders";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { getAvatar } from "@/lib/getAwatar";
import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { ThreadSideBarSkeleton } from "./ThreadSideBarSkeleton";
import { useEffect, useMemo, useRef, useState } from "react";
import { useImageLoadingCoordinator } from "@/hooks/use-image-loading-coordinator";

interface ThreadSidebarProps {
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadSideBar({ user }: ThreadSidebarProps) {
  const { selectedThreadId, closeThread } = useThreadContext();

  // Scroll management state (reused from MessagesList)
  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsBottom] = useState(false);
  const [newMessages, setNewMessages] = useState(false);
  const [pendingAutoScroll, setPendingAutoScroll] = useState(false);
  const lastMessageIdRef = useRef<string | undefined>(undefined);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageLoadingCoordinator = useImageLoadingCoordinator();

  const { data, isLoading } = useQuery(
    orpc.message.thread.list.queryOptions({
      input: {
        messageId: selectedThreadId!,
      },
      enabled: !!selectedThreadId,
    })
  );

  // Reset state when selectedThreadId changes. Schedule asynchronously
  // to avoid synchronous setState inside effects and ref updates during render.
  useEffect(() => {
    if (!selectedThreadId) return;

    const t = setTimeout(() => {
      setHasInitialScroll(false);
      setNewMessages(false);
      setPendingAutoScroll(false);
      lastMessageIdRef.current = undefined;
    }, 0);

    return () => clearTimeout(t);
  }, [selectedThreadId]);

  // Track scroll position to detect if user is at bottom
  const checkIfAtBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    setIsBottom(isNearBottom);
  };

  // Smart auto-scroll that waits for images to load
  const performAutoScroll = useMemo(() => {
    return () => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      setNewMessages(false);
      setPendingAutoScroll(false);
    };
  }, []);

  // Initial scroll to bottom when data loads
  useEffect(() => {
    if (!hasInitialScroll && data?.messages.length) {
      const el = scrollRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
        setTimeout(() => {
          setHasInitialScroll(true);
          setIsBottom(true);
        }, 0);
      }
    }
  }, [data?.messages.length, hasInitialScroll]);

  // Handle pending auto-scroll when images finish loading
  useEffect(() => {
    if (pendingAutoScroll && !imageLoadingCoordinator.isAnyImageLoading) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(performAutoScroll, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [
    pendingAutoScroll,
    imageLoadingCoordinator.isAnyImageLoading,
    performAutoScroll,
  ]);

  // Detect new messages and handle auto-scroll
  useEffect(() => {
    if (!data?.messages.length) return;

    const latestMessageId = data.messages[data.messages.length - 1]?.id;

    if (
      lastMessageIdRef.current &&
      latestMessageId !== lastMessageIdRef.current
    ) {
      setTimeout(() => {
        setNewMessages(true);

        if (isAtBottom) {
          const recentMessages = data.messages.slice(-3);
          const recentMessageIds = recentMessages.map((m) => m.id);
          const hasLoadingImages =
            imageLoadingCoordinator.hasLoadingImages(recentMessageIds);

          if (hasLoadingImages) {
            setPendingAutoScroll(true);
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(performAutoScroll, 5000);
          } else {
            performAutoScroll();
          }
        }
      }, 0);
    }

    lastMessageIdRef.current = latestMessageId;
  }, [data?.messages, isAtBottom, imageLoadingCoordinator, performAutoScroll]);

  if (isLoading) {
    return <ThreadSideBarSkeleton />;
  }

  return (
    <div className="w-120 border-l flex flex-col h-full relative">
      {/* header */}
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          <span>Threads</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={"outline"} size={"icon"} onClick={closeThread}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* main content */}
      <div
        className="flex-1 overflow-y-auto"
        ref={scrollRef}
        onScroll={checkIfAtBottom}
      >
        {data && (
          <div className="p-4 borde-b bg-muted/20">
            <div className="flex space-x-3 items-center">
              <Image
                src={getAvatar(
                  data.parent.authorAvatar,
                  data.parent.authorEmail
                )}
                alt="message user image"
                width={32}
                height={32}
                className="size-8 rounded-full shrink-0"
              />

              <div className="flex flex-col flex-1 space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {data.parent.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                      month: "short",
                      day: "numeric",
                    }).format(data.parent.createdAt)}
                  </span>
                </div>

                <SafeContent
                  className="text-sm wrap-break-word prose max-w-none"
                  content={JSON.parse(data.parent.content)}
                />
              </div>
            </div>
          </div>
        )}

        {/* thread  replies*/}
        <div className="p-2">
          <p className="text-xs text-muted-foreground m-x-2 mb-3 px-2">
            {data?.messages.length} replies
          </p>

          <div className="space-y-1">
            {data?.messages.map((reply) => (
              <ThreadReplies
                selectedThreadId={selectedThreadId!}
                key={reply.id}
                message={reply}
              />
            ))}
          </div>
        </div>
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* New replies indicator */}
      {(newMessages || pendingAutoScroll) && !isAtBottom && (
        <button
          type="button"
          onClick={() => {
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            performAutoScroll();
          }}
          className="absolute bottom-20 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          {pendingAutoScroll ? (
            <>
              Loading images...
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            </>
          ) : (
            <>
              New replies
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </>
          )}
        </button>
      )}

      {/* thread replay form */}
      <div className="border-t p-4">
        <ThreadReplyForm threadId={selectedThreadId!} user={user} />
      </div>
    </div>
  );
}
