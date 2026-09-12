import React from 'react';

import type { MessageImage } from '@/types/chatAttachments';

interface MessageImagesProps {
  images: MessageImage[];
}

/** Images attached to a message, shown above its text in the bubble. */
const MessageImages: React.FC<MessageImagesProps> = ({ images }) => (
  <div className="not-prose mb-2 flex flex-wrap gap-2">
    {images.map(image => (
      <a
        key={image.id}
        href={image.url}
        target="_blank"
        rel="noreferrer"
        className="border-border/40 block max-w-full overflow-hidden rounded-lg border"
      >
        <img
          src={image.url}
          alt={image.name}
          className="max-h-64 max-w-full object-contain sm:max-w-xs"
          loading="lazy"
        />
      </a>
    ))}
  </div>
);

export default MessageImages;
