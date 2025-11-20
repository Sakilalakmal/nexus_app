import { Button } from "@/components/ui/button";
import { MessageSquareText, Pencil } from "lucide-react";

interface messsgeHoverToolBarProps {
  messageId: string;
  canEdit: boolean;
  onEdit: () => void;
}

export function MesssgeHoverToolBar({
  messageId,
  canEdit,
  onEdit,
}: messsgeHoverToolBarProps) {
  return (
    <div
      className="
    border border-border px-1.5 py-1 shadow-sm backdrop-blur transition-opacity opacity-0 group-hover:opacity-100 hover:opacity-100 
    absolute -right-2 -top-3 items-center gap-1 rounded-md"
    >
      {canEdit && (
        <Button variant={"ghost"} onClick={onEdit}>
          <Pencil className="size-4" />
        </Button>
      )}

      <Button variant={"ghost"}>
        <MessageSquareText className="size-4" />
      </Button>
    </div>
  );
}
