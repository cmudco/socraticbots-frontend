import React from 'react';
import { LearningGoalTrackerProps } from '../../types/learningGoal';

const getColorForPercentage = (percentage: number): string => {
    if (percentage === 0) return 'text-gray-400 bg-gray-100';  // not started
    if (percentage < 25) return 'text-red-800 bg-red-50';      // misconceptions (dark red)
    if (percentage < 50) return 'text-red-500 bg-red-50';      // beginning
    if (percentage < 75) return 'text-yellow-500 bg-yellow-50'; // progress
    return 'text-green-500 bg-green-50';                       // mastery
  };

const LearningGoalTracker: React.FC<LearningGoalTrackerProps> = ({ 
  goals,
  onGoalClick 
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {goals.map((goal, index) => (
        <div
          key={index}
          className="relative group"
          onClick={() => onGoalClick?.(index)}
        >
          <div 
            className={`cursor-pointer font-medium px-3 py-1 rounded-md 
                       transition-colors duration-300 hover:opacity-80
                       ${getColorForPercentage(goal.understanding)}`}
          >
            LG{index + 1}
          </div>
          
          {/* Tooltip */}
          <div className="absolute hidden group-hover:block z-50 w-64 p-2 
                        bg-gray-800 text-white text-sm rounded-md shadow-lg 
                        -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="mb-1">{goal.text}</div>
            <div className="text-xs font-medium">
              Understanding: {goal.understanding}%
            </div>
            <div className="w-full bg-gray-600 h-1 mt-1 rounded-full">
              <div 
                className="bg-white h-1 rounded-full transition-all duration-300" 
                style={{ width: `${goal.understanding}%` }}
              />
            </div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                          border-4 border-transparent border-b-gray-800"/>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LearningGoalTracker;