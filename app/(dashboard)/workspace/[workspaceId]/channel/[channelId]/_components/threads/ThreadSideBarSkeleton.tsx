import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";

export function ThreadSideBarSkeleton() {
  return (
    <div className="w-120 border-l flex flex-col h-full">
      {/* Header */}
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Threads</span>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Parent message skeleton */}
        <div className="p-4 border-b bg-muted/20">
          <div className="flex space-x-3 items-start">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex flex-col flex-1 space-y-2 min-w-0">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
              {/* Optional image skeleton */}
              <Skeleton className="h-32 w-48 rounded-md" />
            </div>
          </div>
        </div>

        {/* Replies section */}
        <div className="p-2">
          <div className="flex items-center gap-2 mx-2 mb-3 px-2">
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-12" />
          </div>

          <div className="space-y-1">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="relative flex space-x-3 rounded-lg p-4 group hover:bg-muted/50 border-none shadow-none">
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col space-y-2">
                  <div className="flex items-center gap-x-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  {/* Optional image skeleton */}
                  {i % 3 === 0 && (
                    <Skeleton className="h-24 w-32 rounded-md" />
                  )}
                </div>
                {/* Hover toolbar skeleton */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Card className="flex items-center gap-1 px-2 py-1 shadow-md border">
                    <Skeleton className="size-4" />
                    <Skeleton className="size-4" />
                    <Skeleton className="size-4" />
                  </Card>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Reply form skeleton */}
      <div className="border-t p-4">
        <Card className="rounded-lg border shadow-none">
          <div className="p-3 space-y-3">
            {/* Rich text editor skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            {/* Toolbar skeleton */}
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16 rounded" />
              </div>
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Message List Skeleton Component
export function MessageListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="relative flex space-x-3 rounded-lg p-4 group hover:bg-muted/50 border-none shadow-none">
          <Skeleton className="size-8 rounded-lg shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col space-y-2">
            <div className="flex items-center gap-x-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              {i % 2 === 0 && <Skeleton className="h-4 w-3/5" />}
            </div>
            {/* Optional image skeleton */}
            {i % 5 === 0 && (
              <Skeleton className="h-48 w-64 rounded-md" />
            )}
            {/* Optional replies badge */}
            {i % 3 === 1 && (
              <div className="flex items-center gap-1 mt-2">
                <Skeleton className="size-3" />
                <Skeleton className="h-3 w-16" />
              </div>
            )}
          </div>
          {/* Hover toolbar skeleton */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Card className="flex items-center gap-1 px-2 py-1 shadow-md border">
              <Skeleton className="size-4" />
              <Skeleton className="size-4" />
              <Skeleton className="size-4" />
            </Card>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Single Message Item Skeleton
export function MessageItemSkeleton() {
  return (
    <Card className="relative flex space-x-3 rounded-lg p-4 group hover:bg-muted/50 border-none shadow-none">
      <Skeleton className="size-8 rounded-lg shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col space-y-2">
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      {/* Hover toolbar skeleton */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Card className="flex items-center gap-1 px-2 py-1 shadow-md border">
          <Skeleton className="size-4" />
          <Skeleton className="size-4" />
          <Skeleton className="size-4" />
        </Card>
      </div>
    </Card>
  );
}
