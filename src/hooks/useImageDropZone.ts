import { useCallback, useEffect, useRef, useState } from 'react';

import { useChatAttachmentStore } from '@/stores/core/chatAttachmentStore';

import { imageFilesFromDataTransfer } from '@/utils/chatImages';

/**
 * Makes a container a drop target for chat image attachments. The enter/leave
 * counter keeps the overlay stable while the cursor crosses child elements.
 */
export function useImageDropZone(enabled = true) {
  const attach = useChatAttachmentStore(state => state.attach);
  const [isDragging, setIsDragging] = useState(false);
  const depth = useRef(0);

  const reset = useCallback(() => {
    depth.current = 0;
    setIsDragging(false);
  }, []);

  const onDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!enabled) return;
      depth.current += 1;
      if (event.dataTransfer.types.includes('Files')) setIsDragging(true);
    },
    [enabled]
  );

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    depth.current = Math.max(depth.current - 1, 0);
    if (depth.current === 0) setIsDragging(false);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      reset();
      if (!enabled) return;
      const files = imageFilesFromDataTransfer(event.dataTransfer);
      if (files.length > 0) void attach(files);
    },
    [attach, enabled, reset]
  );

  useEffect(() => {
    window.addEventListener('dragend', reset);
    window.addEventListener('drop', reset);
    return () => {
      window.removeEventListener('dragend', reset);
      window.removeEventListener('drop', reset);
    };
  }, [reset]);

  return { isDragging, dropZoneProps: { onDragEnter, onDragLeave, onDragOver, onDrop } };
}
