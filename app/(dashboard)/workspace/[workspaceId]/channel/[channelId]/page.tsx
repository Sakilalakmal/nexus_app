"use client";

import React from "react";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessagesList } from "./_components/MessagesList";
import { MessageInputForm } from "./_components/Messages/MessageInputForm";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadSideBar } from "./_components/threads/Thread-sidebar";
import { ThreadProviders, useThreadContext } from "@/providers/threadProvders";

const ChannelMainPage = () => {
  const { isThreadOpen } = useThreadContext();

  const { channelId } = useParams<{ channelId: string }>();

  const { data, error, isLoading } = useQuery(
    orpc.channel.get.queryOptions({
      input: {
        channelId,
      },
    })
  );

  if (error) {
    return <div className="p-4 text-red-500">{error.message}</div>;
  }

  return (
    <div className="flex h-screen w-full">
      {/* main channel area */}
      <div className="flex flex-col flex-1 min-w-0">
        {" "}
        {/* fixed header */}
        {isLoading ? (
          <div className="flex items-center justify-between h-14 px-4 border-b">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="size-8" />
            </div>
          </div>
        ) : (
          <ChannelHeader channelName={data?.channelName} />
        )}
        {/* scrollable msg are */}
        <div className="flex-1 overflow-hidden mb-4">
          <MessagesList />
        </div>
        {/* input area */}
        <div className="border-t bg-background p-4">
          <MessageInputForm
            channelId={channelId}
            user={data?.currentUser as KindeUser<Record<string, unknown>>}
          />
        </div>
      </div>
      {isThreadOpen && (
        <ThreadSideBar
          user={data?.currentUser as KindeUser<Record<string, unknown>>}
        />
      )}
    </div>
  );
};

const ThisisChannelPage = () => {
  return (
    <ThreadProviders>
      <ChannelMainPage />
    </ThreadProviders>
  );
};
export default ThisisChannelPage;
