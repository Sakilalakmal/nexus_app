import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAvatar } from "@/lib/getAwatar";
import { organization_user } from "@kinde/management-api-js";
import Image from "next/image";

interface memberItemProps {
  member: organization_user;
}

export function MembersItems({ member }: memberItemProps) {
  return (
    <div className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="size-8">
            <Image
              src={getAvatar(member.picture ?? null, member.email!)}
              alt={"member avatar"}
              fill
              className="object-cover"
            />
            <AvatarFallback>
              {member.full_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* memeber info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium truncate">{member.full_name}</p>
            <Badge variant={"destructive"}>Admin</Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate p-1">
            {member.email}
          </p>
        </div>
      </div>
    </div>
  );
}
