import React, { useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const NotesSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full flex flex-col border-l border-gray-200 bg-white transition-all duration-300 ease-in-out relative`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute left-[-12px] top-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10 transition-all duration-300 ease-in-out"
        title={isCollapsed ? "Expand notes" : "Collapse notes"}
      >
        <div className="transition-transform duration-300 ease-in-out">
          {isCollapsed
            ? <FaChevronLeft size={12} />
            : <FaChevronRight size={12} />
          }
        </div>
      </button>

      <div className={`${isCollapsed ? 'flex flex-col items-center justify-center ' : 'flex justify-between items-center'} p-4 border-b border-gray-200 transition-all duration-300 ease-in-out`}>
        <div className="transition-opacity duration-300 ease-in-out">
          {isCollapsed ? (
            <NotebookPen className="w-5 h-5 text-gray-600" />
          ) : (
            <div className="flex items-center space-x-2">
              <NotebookPen className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
            </div>
          )}
        </div>
      </div>
      <div className={`transition-all duration-300 ease-in-out ${!isCollapsed ? 'flex-1 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
        {!isCollapsed && (
          <div className="p-4 h-full">
            <textarea
              placeholder="Type your notes here..."
              className="w-full h-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors duration-200"
            ></textarea>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSidebar;
