import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { SearchCheck, Users } from "lucide-react";
import { useState } from "react";
import { MembersItems } from "./Member-Item";
import { Skeleton } from "@/components/ui/skeleton";

export function MembersOverView() {
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  const { data, error, isLoading } = useQuery(
    orpc.workspace.member.list.queryOptions()
  );

  if (error) {
    return <h1>Error:{error.message}</h1>;
  }

  const members = data ?? [];

  const query = search.trim().toLowerCase();

  const filteredMembers = members.filter((member) => {
    const name = member.full_name?.toLowerCase().includes(query);
    const email = member.email?.toLowerCase().includes(query);
    return name || email;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <Users className="size-4" />
          <span>Members</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px]">
        <div className="p-0">
          {/* header */}
          <div className="p-x-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Workspace members</h3>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>

          {/* searching */}
          <div className="p-3  border-b">
            <div className="relative">
              <SearchCheck className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="search members...."
                className="pl-9"
              />
            </div>
          </div>

          {/* members */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-2">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-2 w-32" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                </div>
              ))
            ) : filteredMembers.length === 0 ? (
              <p className="p-x-4 py-6 text-muted-foreground">
                No Members Found
              </p>
            ) : (
              filteredMembers.map((member) => (
                <MembersItems member={member} key={member.id} />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
