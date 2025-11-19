import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface attachmentProps {
  url: string;
  onRemove: () => void;
}

export function Attachment({ url, onRemove }: attachmentProps) {
  return (
    <div className="group relative overflow-hidden rounded-md bg-muted size-15">
      <Image className="object-cover" src={url} alt="attachment" fill />
      <div className="absolute inset-0 grid place-items-center bg-black/0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
        <Button
          type="button"
          variant={"destructive"}
          className="size-5 rounded-full"
          onClick={onRemove}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
