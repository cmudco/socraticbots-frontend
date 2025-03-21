// src/components/chat/TrackingSidebar.tsx
import React from 'react';

const TrackingSidebar: React.FC = () => {
  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Learning Progress</h2>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Progress Report</h3>
        <div className="mb-2">
          <div className="text-sm mb-1">Progress Key:</div>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-red-500"></div>
            ))}
          </div>
          <div className="flex space-x-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-orange-500"></div>
            ))}
          </div>
          <div className="flex space-x-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-green-500"></div>
            ))}
          </div>
          <div className="text-xs text-gray-600 mt-1">0% 20% 40% 60% 80% 100%</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">LG1: Understanding Concept</h3>
        <div className="text-sm mb-2">
          Coverage: <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-xs">50%</span>
        </div>
        <p className="text-sm text-gray-700">
          The student has been introduced to the concept but needs more practice.
        </p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">LG2: Problem Solving</h3>
        <div className="text-sm mb-2">
          Coverage: <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-xs">50%</span>
        </div>
        <p className="text-sm text-gray-700">
          The student can solve basic problems but struggles with complex ones.
        </p>
      </div>
    </div>
  );
};

export default TrackingSidebar;
