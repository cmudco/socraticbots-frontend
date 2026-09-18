import React from 'react';

import { ImagePlus } from 'lucide-react';

interface ImageDropOverlayProps {
  isVisible: boolean;
}

/** Full-pane hint shown while files are dragged over a chat surface. */
const ImageDropOverlay: React.FC<ImageDropOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      className="bg-background/80 absolute inset-0 z-40 flex items-center justify-center backdrop-blur-sm"
      aria-hidden="true"
    >
      <div className="border-primary bg-card flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-12 py-8 shadow-lg">
        <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
          <ImagePlus className="text-primary h-7 w-7" />
        </div>
        <p className="text-lg font-semibold">Drop images to attach them</p>
        <p className="text-muted-foreground text-sm">They will be sent with your next message</p>
      </div>
    </div>
  );
};

export default ImageDropOverlay;
