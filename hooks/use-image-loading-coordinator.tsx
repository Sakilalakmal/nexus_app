"use client";

import { useCallback, useMemo, useState } from "react";

interface ImageLoadingState {
  loadingImages: Set<string>;
  pendingImages: Set<string>;
}

export function useImageLoadingCoordinator() {
  const [state, setState] = useState<ImageLoadingState>({
    loadingImages: new Set(),
    pendingImages: new Set(),
  });

  const registerImageStart = useCallback((messageId: string) => {
    setState(prev => ({
      loadingImages: new Set([...prev.loadingImages, messageId]),
      pendingImages: new Set([...prev.pendingImages, messageId]),
    }));
  }, []);

  const registerImageComplete = useCallback((messageId: string) => {
    setState(prev => {
      const newLoadingImages = new Set(prev.loadingImages);
      const newPendingImages = new Set(prev.pendingImages);
      
      newLoadingImages.delete(messageId);
      newPendingImages.delete(messageId);
      
      return {
        loadingImages: newLoadingImages,
        pendingImages: newPendingImages,
      };
    });
  }, []);

  const registerImageError = useCallback((messageId: string) => {
    setState(prev => {
      const newLoadingImages = new Set(prev.loadingImages);
      const newPendingImages = new Set(prev.pendingImages);
      
      newLoadingImages.delete(messageId);
      newPendingImages.delete(messageId);
      
      return {
        loadingImages: newLoadingImages,
        pendingImages: newPendingImages,
      };
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setState({
      loadingImages: new Set(),
      pendingImages: new Set(),
    });
  }, []);

  const isAnyImageLoading = useMemo(() => 
    state.loadingImages.size > 0
  , [state.loadingImages.size]);

  const hasLoadingImages = useCallback((messageIds: string[]) => {
    return messageIds.some(id => state.loadingImages.has(id));
  }, [state.loadingImages]);

  return {
    isAnyImageLoading,
    loadingImagesCount: state.loadingImages.size,
    pendingImagesCount: state.pendingImages.size,
    registerImageStart,
    registerImageComplete,
    registerImageError,
    clearAllLoading,
    hasLoadingImages,
  };
}

export type ImageLoadingCoordinatorType = ReturnType<typeof useImageLoadingCoordinator>;