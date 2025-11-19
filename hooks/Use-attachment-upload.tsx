"use client";

import { useCallback, useMemo, useState } from "react";
import { set } from "zod";

export function useAttachmentUpload() {
  const [isOpen, setOpen] = useState(false);

  const [stageUrl, setStageUrl] = useState<null | string>(null);

  const [isUploading, setIsUploading] = useState(false);

  const onUploaded = useCallback((url: string) => {
    setStageUrl(url);
    setIsUploading(false);
    setOpen(false);
  }, []);

  const clearImage = useCallback(() => {
    setStageUrl(null);
    setIsUploading(false);
  }, []);

  const startUpload = useCallback(() => {
    setIsUploading(true);
  }, []);

  return useMemo(
    () => ({
      isOpen,
      setOpen,
      onUploaded,
      setIsUploading,
      startUpload,
      isUploading,
      stageUrl,
      clearImage,
    }),
    [
      isOpen,
      setOpen,
      onUploaded,
      stageUrl,
      setIsUploading,
      startUpload,
      isUploading,
      clearImage,
    ]
  );
}

export type useAttachmentType = ReturnType<typeof useAttachmentUpload>;
