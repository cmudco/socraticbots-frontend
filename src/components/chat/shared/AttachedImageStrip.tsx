import React from 'react';

import { X } from 'lucide-react';

import { useAttachedImages, useChatAttachmentStore } from '@/stores/core/chatAttachmentStore';

interface AttachedImageStripProps {
  disabled?: boolean;
}

/** Thumbnails of the images staged for the next message, each removable. */
const AttachedImageStrip: React.FC<AttachedImageStripProps> = ({ disabled = false }) => {
  const images = useAttachedImages();
  const remove = useChatAttachmentStore(state => state.remove);

  if (images.length === 0) return null;

  return (
    <ul className="mb-3 flex flex-wrap gap-3" aria-label="Attached images">
      {images.map(image => (
        <li key={image.id} className="group border-border relative rounded-xl border">
          <img src={image.preview} alt={image.name} className="h-24 w-24 rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => remove(image.id)}
            disabled={disabled}
            className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100 disabled:hidden"
            aria-label={`Remove ${image.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <span className="absolute right-0 bottom-0 left-0 truncate rounded-b-xl bg-black/60 px-2 py-1 text-center text-[11px] text-white">
            {image.name}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default AttachedImageStrip;
