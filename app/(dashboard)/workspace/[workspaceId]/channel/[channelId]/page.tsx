"use client";

import React from "react";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessagesList } from "./_components/MessagesList";
import { MessageInputForm } from "./_components/Messages/MessageInputForm";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const ChannelMainPage = () => {
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
        <ChannelHeader channelName={data?.channelName} />
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
    </div>
  );
};

export default ChannelMainPage;
