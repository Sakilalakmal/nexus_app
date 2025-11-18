import Image from "next/image";

interface messagesProps {
  id: number;
  messages: string;
  date: Date;
  avatar: string;
  username: string;
}

export function MessageItem({
  id,
  messages,
  date,
  avatar,
  username,
}: messagesProps) {
  return (
    <div className="relative flex space-x-3 rounded-lg p-4 group hover:bg-muted/50">
      <Image
        src={avatar}
        alt="user avatar"
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />

      <div className="flex min-w-0 flex-1 flex-col space-y-1">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{username}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(date)}{" "}
            {new Intl.DateTimeFormat("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }).format(date)}
          </p>
        </div>

        <p className="text-sm wrap-break-word text-foreground">{messages}</p>
      </div>
    </div>
  );
}
