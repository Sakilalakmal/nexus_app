import { Recycle, Sparkle } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/server";
import { client } from "@/lib/orpc";
interface ComposeAssistantProps {
  content: string;
}

export function ComposeAssistant({ content }: ComposeAssistantProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  function handleOpenChange(nextOpen: boolean) {
    console.log("Popover open state changed:", nextOpen);
    setOpen(nextOpen);

    if (nextOpen) {
      const hasAssistantMessage = messages.some((m) => m.role === "assistant");

      if (status !== "ready" || hasAssistantMessage) {
        return;
      }

      sendMessage({ text: "rewrite" });
    } else {
      stop();
      clearError();
      setMessages([]);
    }
  }

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    stop,
    clearError,
  } = useChat({
    id: "compose-assistant-chat",
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await client.ai.compose.generate(
            {
              content: contentRef.current,
            },
            { signal: options.abortSignal }
          )
        );
      },
      reconnectToStream() {
        throw new Error("un supported");
      },
    },
  });

  const lastAssistant = messages.findLast((m) => m.role === "assistant");

  const summaryText =
    lastAssistant?.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n\n") ?? "";

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
              <span className="text-sm font-medium">Composer Assistant</span>
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
              Click compose to get assistant...
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-3 py-2 bg-muted/30">
          <Button
            type="submit"
            size={"sm"}
            variant={"outline"}
            onClick={() => {
              stop();
              clearError();
              setMessages([]);
              setOpen(false);
            }}
          >
            Decline...
          </Button>
          <Button type="submit" size={"sm"}>
            Accept
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
