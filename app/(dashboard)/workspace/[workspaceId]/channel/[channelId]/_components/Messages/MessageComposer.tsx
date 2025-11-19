import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { ImageUploadModel } from "@/components/rich-text-editor/ImageUploadModel";
import { Button } from "@/components/ui/button";
import { useAttachmentType } from "@/hooks/Use-attachment-upload";
import { Image, Send } from "lucide-react";
import { Attachment } from "./AttachMent";

interface messageComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSending?: boolean;
  uplaod: useAttachmentType;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSending,
  uplaod,
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
          uplaod.stageUrl ? (
            <>
              <Attachment url={uplaod.stageUrl} onRemove={uplaod.clearImage} />
            </>
          ) : (
            <>
              <Button
                onClick={() => uplaod.setOpen(true)}
                type="button"
                size={"sm"}
                variant={"outline"}
              >
                <Image className="size-4 mr-1" />
                Upload
              </Button>
            </>
          )
        }
      />

      <ImageUploadModel
        onOpenChange={uplaod.setOpen}
        open={uplaod.isOpen}
        onUploaded={(url) => uplaod.onUploaded(url)}
        startUpload={uplaod.startUpload}
      />
    </>
  );
}
