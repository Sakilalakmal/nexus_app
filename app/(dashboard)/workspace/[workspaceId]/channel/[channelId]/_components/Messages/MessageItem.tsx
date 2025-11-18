import { MessageSchemaType } from "@/app/schemas/messages";
import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { Message } from "@/lib/generated/prisma/client";
import { getAvatar } from "@/lib/getAwatar";
import Image from "next/image";

interface messagesProps {
  message: Message;
}

export function MessageItem({ message }: messagesProps) {
  return (
    <div className="relative flex space-x-3 rounded-lg p-4 group hover:bg-muted/50">
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        alt="user avatar"
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />

      <div className="flex min-w-0 flex-1 flex-col space-y-1">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{message.authorName}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(message.createdAt)}{" "}
            {new Intl.DateTimeFormat("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }).format(message.createdAt)}
          </p>
        </div>

        <SafeContent
          content={JSON.parse(message.content)}
          className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
        />
      </div>
    </div>
  );
}
