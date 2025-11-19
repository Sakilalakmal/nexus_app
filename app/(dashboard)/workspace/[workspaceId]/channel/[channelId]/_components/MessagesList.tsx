"use client";

import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { MessageItem } from "./Messages/MessageItem";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useImageLoadingCoordinator } from "@/hooks/use-image-loading-coordinator";

export function MessagesList() {
  const { channelId } = useParams<{ channelId: string }>();

  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [isAtBottom, setIsBottom] = useState(false);

  const [newMessages, setNewMessages] = useState(false);
  const [pendingAutoScroll, setPendingAutoScroll] = useState(false);

  const lastIteIdRef = useRef<string | undefined>(undefined);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const imageLoadingCoordinator = useImageLoadingCoordinator();

  const infiniteOptions = orpc.message.list.infiniteOptions({
    input: (pageparam: string | undefined) => ({
      channelId,
      cursor: pageparam,
      limit: 30,
    }),
    queryKey: ["messages-list", channelId],
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: data.pages.map((p) => ({ ...p, items: [...p.items].reverse() })),
      pageParams: data.pageParams,
    }),
  });

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    ...infiniteOptions,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  useEffect(() => {
    if (!hasInitialScroll && data?.pages.length) {
      const el = scrollRef.current;

      if (el) {
        el.scrollTop = el.scrollHeight;
        // Defer state updates to avoid cascading renders
        setTimeout(() => {
          setHasInitialScroll(true);
          setIsBottom(true);
        }, 0);
      }
    }
  }, [data?.pages.length, hasInitialScroll]);

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

  // Handle pending auto-scroll when images finish loading
  useEffect(() => {
    if (pendingAutoScroll && !imageLoadingCoordinator.isAnyImageLoading) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Small delay to ensure DOM has updated
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
    if (!data?.pages.length) return;

    const currentItems = data.pages.flatMap((page) => page.items);
    const latestMessageId = currentItems[currentItems.length - 1]?.id;

    // Check if we have new messages
    if (lastIteIdRef.current && latestMessageId !== lastIteIdRef.current) {
      // Defer state updates to avoid cascading renders
      setTimeout(() => {
        setNewMessages(true);

        // Auto-scroll only if user was at bottom
        if (isAtBottom) {
          // Check if the new messages have images that are still loading
          const recentMessages = currentItems.slice(-5); // Check last 5 messages
          const recentMessageIds = recentMessages.map((m) => m.id);
          const hasLoadingImages =
            imageLoadingCoordinator.hasLoadingImages(recentMessageIds);

          if (hasLoadingImages) {
            // Set pending scroll and wait for images
            setPendingAutoScroll(true);

            // Fallback timeout - auto-scroll after 5 seconds even if images haven't loaded
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(performAutoScroll, 5000);
          } else {
            // No images loading, scroll immediately
            performAutoScroll();
          }
        }
      }, 0);
    }

    lastIteIdRef.current = latestMessageId;
  }, [data?.pages, isAtBottom, imageLoadingCoordinator, performAutoScroll]);

  const handleScroll = () => {
    const el = scrollRef.current;

    if (!el) return;

    // Check if user is at bottom
    checkIfAtBottom();

    // Load older messages when scrolling to top
    if (el.scrollTop <= 80 && hasNextPage && !isFetching) {
      const previousHeight = el.scrollHeight;
      const prevScrollTop = el.scrollTop;

      fetchNextPage().then(() => {
        // maintain scroll position after loading older messages
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = newScrollHeight - previousHeight + prevScrollTop;
      });
    }
  };

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  return (
    <div className="relative h-full">
      <div
        className="h-full overflow-y-auto px-4"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {items.map((messag) => (
          <MessageItem
            key={messag.id}
            message={messag}
            imageLoadingCoordinator={imageLoadingCoordinator}
            currentUserId={user.id}
          />
        ))}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* New messages indicator */}
      {(newMessages || pendingAutoScroll) && !isAtBottom && (
        <button
          type="button"
          onClick={() => {
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            performAutoScroll();
          }}
          className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          {pendingAutoScroll ? (
            <>
              Loading images...
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            </>
          ) : (
            <>
              New messages
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
    </div>
  );
}
