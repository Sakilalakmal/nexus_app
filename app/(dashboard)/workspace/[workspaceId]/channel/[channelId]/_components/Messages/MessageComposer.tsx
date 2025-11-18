import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import { Image, Send } from "lucide-react";

interface messageComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSending?: boolean;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSending,
}: messageComposerProps) {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button
            type="button"
            size={"sm"}
            onClick={onSubmit}
            disabled={isSending}
          >
            <Send className="size-4 mr-1" />
            Send
          </Button>
        }
        leftFooter={
          <Button type="button" size={"sm"} variant={"outline"}>
            <Image className="size-4 mr-1" />
            Upload
          </Button>
        }
      />
    </>
  );
}
