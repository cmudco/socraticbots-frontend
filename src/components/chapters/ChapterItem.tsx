// src/components/chapters/ChapterItem.tsx
import React from 'react';
import { Chapter } from '../../services/chapters.service';

interface ChapterItemProps {
  chapter: Chapter;
  onEdit: () => void;
  onDelete: () => void;
}

const ChapterItem: React.FC<ChapterItemProps> = ({ chapter, onEdit, onDelete }) => {
  return (
    <div className="flex justify-between items-center p-3 border rounded bg-white">
      <div>
        <h4 className="font-medium">{chapter.title}</h4>
        <div className="text-sm text-gray-600">
          <span className="mr-3">Subject: {chapter.subject}</span>
          <span>Topic: {chapter.topic}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ChapterItem;
