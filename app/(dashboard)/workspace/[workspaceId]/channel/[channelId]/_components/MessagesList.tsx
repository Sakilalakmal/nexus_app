"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { MessageItem } from "./Messages/MessageItem";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { set } from "zod";

export function MessagesList() {
  const { channelId } = useParams<{ channelId: string }>();

  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [isAtBottom, setIsBottom] = useState(false);

  const [newMessages, setNewMessages] = useState(false);

  const lastIteIdRef = useRef<string | undefined>(undefined);

  const infiniteOptions = orpc.message.list.infiniteOptions({
    input: (pageparam: string | undefined) => ({
      channelId,
      cursor: pageparam,
      limit: 30,
    }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: data.pages.map((p) => ({ ...p, items: [...p.items].reverse() })),
      pageParams: data.pageParams,
    }),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    error,
  } = useInfiniteQuery({
    ...infiniteOptions,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!hasInitialScroll && data?.pages.length) {
      const el = scrollRef.current;

      if (el) {
        el.scrollTop = el.scrollHeight;
        setHasInitialScroll(true);
        setIsBottom(true);
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

  // Detect new messages and handle auto-scroll
  useEffect(() => {
    if (!data?.pages.length) return;

    const currentItems = data.pages.flatMap((page) => page.items);
    const latestMessageId = currentItems[currentItems.length - 1]?.id;

    // Check if we have new messages
    if (lastIteIdRef.current && latestMessageId !== lastIteIdRef.current) {
      setNewMessages(true);

      // Auto-scroll only if user was at bottom
      if (isAtBottom) {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
        setNewMessages(false);
      }
    }

    lastIteIdRef.current = latestMessageId;
  }, [data?.pages, isAtBottom]);

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
          <MessageItem key={messag.id} message={messag} />
        ))}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* New messages indicator */}
      {newMessages && !isAtBottom && (
        <button
        type="button"
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setNewMessages(false);
          }}
          className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
        >
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
        </button>
      )}
    </div>
  );
}
