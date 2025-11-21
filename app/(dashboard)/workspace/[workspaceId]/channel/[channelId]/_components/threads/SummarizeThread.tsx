import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Recycle, Sparkle } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import { client } from "@/lib/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface SummarizeThreadProps {
  messageId: string;
}

export function SummarizeThread({ messageId }: SummarizeThreadProps) {
  const [open, setOpen] = useState(false);

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    stop,
    clearError,
  } = useChat({
    id: `thread-summary-chat:${messageId}`,
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await client.ai.threads.summary.generate(
            {
              messageId,
            },
            { signal: options.abortSignal }
          )
        );
      },
      reconnectToStream() {
        throw new Error("Not implemented");
      },
    },
  });

  const lastAssistant = messages.findLast((m) => m.role === "assistant");

  const summaryText =
    lastAssistant?.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n\n") ?? "";

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      const hasAssistantMessage = messages.some((m) => m.role === "assistant");

      if (status !== "ready" || hasAssistantMessage) {
        return;
      }

      sendMessage({ text: "summarize - thread" });
    } else {
      stop();
      clearError();
      setMessages([]);
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size={"sm"}
          className="bg-gradient-to-r from-green-500 via-blue-400 to-blue-600 text-white hover:from-green-600 hover:via-blue-500 hover:to-blue-700"
        >
          <span className="flex items-center">
            <Sparkle className="size-4" />
            <span>Summarize</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[25rem]">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <span className="p-2 relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 via-blue-400 to-blue-600 text-white hover:from-green-600 hover:via-blue-500 hover:to-blue-700">
              <Sparkle className="size-4" />
              <span className="text-sm font-medium">
                Ai Summary for this thread
              </span>
            </span>
          </div>
          {status === "streaming" && (
            <Button onClick={() => stop()} type="button" variant={"outline"}>
              Stop
            </Button>
          )}
        </div>

        <div className="px-4 py-3 max-h-80 overflow-y-auto">
          {error ? (
            <div>
              <div>
                <p className="text-red-500">{error.message}</p>
                <Button
                  type="button"
                  size={"sm"}
                  onClick={() => {
                    clearError();
                    setMessages([]);
                    sendMessage({
                      text: "summarize - thread",
                    });
                  }}
                >
                  <Recycle className="size-4" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : summaryText ? (
            <p>{summaryText}</p>
          ) : status === "submitted" || status === "streaming" ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Click Summarize to generate a summary
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
