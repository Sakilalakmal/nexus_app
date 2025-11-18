import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { client } from "@/lib/orpc";
import { Cloud } from "lucide-react";
import { redirect } from "next/navigation";
import { CreateNewChannel } from "./_components/CreateNewChannel";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

async function WorkspacePage({ params }: WorkspacePageProps) {
  const { channels } = await client.channel.list();

  const { workspaceId } = await params;

  if (channels.length > 0) {
    return redirect(`/workspace/${workspaceId}/channel/${channels[0].id}`);
  }
  return (
    <div className="p-22 flex flex-1">
      <Empty className="border border-dashed from-muted/50 to-background h-full bg-linear-to-b from-30%">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Cloud />
          </EmptyMedia>
          <EmptyTitle>No channel available</EmptyTitle>
          <EmptyDescription>
            Create your first channel to start collaborating with your team.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="max-w-xs">
          <CreateNewChannel />
        </EmptyContent>
      </Empty>
    </div>
  );
}

export default WorkspacePage;
