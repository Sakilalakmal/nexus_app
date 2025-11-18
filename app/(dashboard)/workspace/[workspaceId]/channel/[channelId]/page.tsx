"use client";


import React from "react";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessagesList } from "./_components/MessagesList";
import { MessageInputForm } from "./_components/Messages/MessageInputForm";
import { useParams } from "next/navigation";

const ChannelMainPage = () => {
  const { channelId } = useParams<{ channelId: string }>();

  return (
    <div className="flex h-screen w-full">
      {/* main channel area */}
      <div className="flex flex-col flex-1 min-w-0">
        {" "}
        {/* fixed header */}
        <ChannelHeader />
        {/* scrollable msg are */}
        <div className="flex-1 overflow-hidden mb-4">
          <MessagesList />
        </div>
        {/* input area */}
        <div className="border-t bg-background p-4">
          <MessageInputForm channelId={channelId} />
        </div>
      </div>
    </div>
  );
};

export default ChannelMainPage;
