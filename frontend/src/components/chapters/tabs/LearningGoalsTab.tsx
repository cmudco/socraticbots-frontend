// src/components/chapters/tabs/LearningGoalsTab.tsx
import React, { useState } from 'react';

// Dummy data for the mockup
const initialGoals = [
  {
    id: '1',
    title: 'Learn Touchdowns',
    subGoals: [
      { id: '1-1', title: 'How Many Points' },
      { id: '1-2', title: 'Ways to score' }
    ]
  },
  {
    id: '2',
    title: 'Understand Football Rules',
    subGoals: []
  }
];

const LearningGoalsTab: React.FC = () => {
  const [goals, setGoals] = useState(initialGoals);
  const [newGoalText, setNewGoalText] = useState('');
  
  // Just for UI mockup, not implementing actual functionality
  const handleAddMainGoal = () => {
    alert('This would add a new main goal: ' + newGoalText);
    setNewGoalText('');
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Learning Goals</h3>
      </div>
      
      {/* Main goals list */}
      <div className="space-y-6">
        {goals.map(goal => (
          <div key={goal.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-800">{goal.title}</span>
              </div>
              <div>
                <button className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
                  Edit
                </button>
              </div>
            </div>
            
            {/* Sub-goals section */}
            <div className="ml-6 mt-3">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Sub-goals:</h4>
              <ul className="space-y-2">
                {goal.subGoals.map(subGoal => (
                  <li key={subGoal.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>{subGoal.title}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
                        Edit
                      </button>
                      <button className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-red-700">
                        ×
                      </button>
                    </div>
                  </li>
                ))}
                {/* Quick add sub-goal field */}
                <li className="flex items-center">
                  <span className="text-gray-500 mr-2">•</span>
                  <input 
                    type="text" 
                    placeholder="Add new sub-goal..." 
                    className="flex-1 px-3 py-1 text-sm border rounded"
                  />
                  <button className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                    Add
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add new main goal section */}
      <div className="mt-6 flex items-center">
        <input 
          type="text" 
          placeholder="Add new main goal..." 
          className="flex-1 px-3 py-2 border rounded mr-2"
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
        />
        <button 
          onClick={handleAddMainGoal}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add
        </button>
      </div>
      
      <div className="mt-8 p-3 bg-blue-50 rounded text-sm text-blue-800">
        <p className="font-medium">Note:</p>
        <p>This is a UI mockup. The functionality will be implemented in later phases.</p>
      </div>
    </div>
  );
};

export default LearningGoalsTab;
