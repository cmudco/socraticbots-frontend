// src/components/chapters/ChapterItem.tsx
import React from 'react';

import { Edit, Trash } from 'lucide-react';

import { Chapter } from '@/services/chapters.service';

import { Button } from '@/components/ui/button';

interface ChapterItemProps {
  chapter: Chapter;
  onEdit: () => void;
  onDelete: () => void;
}

const ChapterItem: React.FC<ChapterItemProps> = ({ chapter, onEdit, onDelete }) => {
  return (
    <div className="flex items-center justify-between rounded border bg-white p-3">
      <div className="flex-1">
        <h4 className="font-medium">{chapter.title}</h4>
        <div className="text-sm text-gray-600">
          <span className="mr-3">Subject: {chapter.subject}</span>
          <span>Topic: {chapter.topic}</span>
        </div>
      </div>
      <div className="flex space-x-1">
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-700"
          title="Edit chapter"
        >
          <Edit size={14} className="mr-1" />
          Edit
        </Button>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-gray-600 hover:bg-red-100 hover:text-red-700"
          title="Delete chapter"
        >
          <Trash size={14} className="mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ChapterItem;
