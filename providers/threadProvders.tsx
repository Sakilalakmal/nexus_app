"use client";

import { createContext, useContext, useState } from "react";

interface ThreadProvidersProps {
  selectedThreadId: string | null;
  openThread?: (messageId: string) => void;
  closeThread?: () => void;
  toggleThread?: (messageId: string) => void;
  isThreadOpen?: boolean;
}

const ThreadContext = createContext<ThreadProvidersProps | undefined>(
  undefined
);

export function ThreadProviders({ children }: { children: React.ReactNode }) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const [isThreadOpen, setIsThreadOpen] = useState(false);

  const oepnThread = (messageId: string) => {
    setSelectedThreadId(messageId);
    setIsThreadOpen(true);
  };

  const closeThread = () => {
    setSelectedThreadId(null);
    setIsThreadOpen(false);
  };

  const toggleThread = (messageId: string) => {
    if (selectedThreadId === messageId && isThreadOpen) {
      closeThread();
    } else {
      oepnThread(messageId);
    }
  };

  const value: ThreadProvidersProps = {
    selectedThreadId,
    openThread: oepnThread,
    closeThread,
    toggleThread,
    isThreadOpen,
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

export function useThreadContext() {
  const context = useContext(ThreadContext);

  if (context === undefined) {
    throw new Error("useThreadContext must be used within a ThreadProviders");
  }

  return context;
}
