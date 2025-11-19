import { UploadDropzone } from "@/lib/uploadthing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";

interface imageUploadModelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (url: string) => void;
  startUpload?: () => void;
}

export function ImageUploadModel({
  open,
  onOpenChange,
  onUploaded,
  startUpload,
}: imageUploadModelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach an Image</DialogTitle>
        </DialogHeader>
        <UploadDropzone
          className="ut-uploading:opacity-90 ut-ready:bg-card ut-ready:border-border ut-uploading:bg-muted ut-uploading:border-muted ut-label:text-sm ut-allowed-content:text-xs ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/80 flex flex-col items-center justify-center border-2 border-dashed "
          appearance={{
            container: "bg-card",
            label: "text-muted-foreground",
            allowedContent: "text-xs text-muted-foreground",
            button: "bg-primary text-primary-foreground hover:bg-primary/50",
          }}
          endpoint={"imageUploader"}
          onUploadBegin={() => {
            startUpload?.();
            toast.info("Uploading image...");
          }}
          onClientUploadComplete={(result) => {
            console.log("Upload result:", result);

            const url = result[0]?.url || result[0]?.ufsUrl;

            if (url) {
              toast.success("Image uploaded successfully!");
              onUploaded(url);
              onOpenChange(false); // Force close the dialog
            } else {
              console.error("No URL found in upload result:", result);
              toast.error("Upload completed but no URL received");
            }
          }}
          onUploadError={(error) => {
            console.error("Upload error:", error);
            toast.error(`Upload failed: ${error.message}`);
            onOpenChange(false); // Close dialog on error too
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
