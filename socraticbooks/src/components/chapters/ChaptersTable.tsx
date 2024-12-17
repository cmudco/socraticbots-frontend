// src/components/chapters/ChaptersTable.tsx
import React from 'react';
import ChatButton from '../chat/ChatButton';
import { Chapter } from '../../types/chapter';

interface ChaptersTableProps {
  chapters: Chapter[];
}

const ChaptersTable: React.FC<ChaptersTableProps> = ({ chapters }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Your existing table headers */}
        <tbody>
          {chapters.map((chapter) => (
            <tr key={chapter.id}>
              {/* Your existing table cells */}
              <td className="px-6 py-4 whitespace-nowrap">
              <ChatButton chapterId={chapter.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChaptersTable;