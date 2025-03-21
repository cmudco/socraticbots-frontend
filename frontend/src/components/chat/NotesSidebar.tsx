// src/components/chat/NotesSidebar.tsx
import React from 'react';

const NotesSidebar: React.FC = () => {
  return (
    <div className="w-72 h-full flex flex-col border-l border-gray-200 bg-white">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Notes</h2>
        <button className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm">Save Notes</button>
      </div>
      <div className="flex-1 p-4">
        <textarea 
          placeholder="Type your notes here..."
          className="w-full h-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
        ></textarea>
      </div>
    </div>
  );
};

export default NotesSidebar;
