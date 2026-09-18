import React, { useRef } from 'react';

import { ImagePlus } from 'lucide-react';

import { useChatAttachmentStore } from '@/stores/core/chatAttachmentStore';

import { Button } from '@/components/ui/button';

interface AttachImageButtonProps {
  disabled?: boolean;
  roundedClass?: string;
}

/** File-picker entry point for attachments; drag-and-drop and paste are the other two. */
const AttachImageButton: React.FC<AttachImageButtonProps> = ({
  disabled = false,
  roundedClass = 'rounded-2xl',
}) => {
  const attach = useChatAttachmentStore(state => state.attach);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={event => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (files.length > 0) void attach(files);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={`h-12 w-12 p-0 ${roundedClass}`}
        aria-label="Attach images"
        title="Attach images"
      >
        <ImagePlus className="h-5 w-5" />
      </Button>
    </>
  );
};

export default AttachImageButton;
