import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { getAvatar } from "@/lib/getAwatar";
import { Message } from "@prisma/client";
import Image from "next/image";

interface ThreadRepliesProps {
  message: Message;
}

export function ThreadReplies({ message }: ThreadRepliesProps) {
  return (
    <div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        alt="avatar image"
        width={32}
        height={32}
        className="size-8 rounded-full shrink-0"
      />

      <div className="flex flex-col flex-1 space-y-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              month: "short",
              day: "numeric",
            }).format(message.createdAt)}
          </span>
        </div>

        <SafeContent
          className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
          content={JSON.parse(message.content)}
        />
      </div>
    </div>
  );
}
