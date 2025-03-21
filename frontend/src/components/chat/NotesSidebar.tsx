// src/components/chat/NotesSidebar.tsx
import React from 'react';

const NotesSidebar: React.FC = () => {
  return (
    <div className="w-64 h-full bg-white border-l border-gray-200 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notes</h2>
        <button className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm">Save Notes</button>
      </div>
      <textarea 
        placeholder="Type your notes here..."
        className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
      ></textarea>
    </div>
  );
};

export default NotesSidebar;
