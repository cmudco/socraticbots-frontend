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
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  
  // Handle starting drag of a main goal
  const handleDragStart = (id: string) => {
    setDraggedGoalId(id);
  };
  
  // Handle dropping a main goal
  const handleDrop = (targetId: string) => {
    if (!draggedGoalId || draggedGoalId === targetId) return;
    
    const sourceIndex = goals.findIndex(g => g.id === draggedGoalId);
    const targetIndex = goals.findIndex(g => g.id === targetId);
    
    if (sourceIndex === -1 || targetIndex === -1) return;
    
    // Create a new array and reorder
    const newGoals = [...goals];
    const [removed] = newGoals.splice(sourceIndex, 1);
    newGoals.splice(targetIndex, 0, removed);
    
    setGoals(newGoals);
    setDraggedGoalId(null);
  };
  
  // Just for UI mockup, not implementing actual functionality
  const handleAddMainGoal = () => {
    if (!newGoalText.trim()) return;
    
    const newGoal = {
      id: `new-${Date.now()}`, // Temporary ID for mockup
      title: newGoalText,
      subGoals: []
    };
    
    setGoals([...goals, newGoal]);
    setNewGoalText('');
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Learning Goals</h3>
      </div>
      
      {/* Main goals list */}
      <div className="space-y-6">
        {goals.map((goal, index) => (
          <div 
            key={goal.id} 
            className={`border rounded-lg p-4 bg-white shadow-sm ${
              draggedGoalId === goal.id ? 'opacity-50' : ''
            }`}
            draggable
            onDragStart={() => handleDragStart(goal.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(goal.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-gray-500 mr-2 cursor-move">☰</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                  LG{index + 1}
                </span>
                <span className="font-medium text-gray-800">{goal.title}</span>
              </div>
              <div>
                <button className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
                  Edit
                </button>
              </div>
            </div>
            
            {/* Sub-goals section (not draggable) */}
            <div className="ml-6 mt-3">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Sub-goals:</h4>
              <ul className="space-y-2">
                {goal.subGoals.map((subGoal, subIndex) => (
                  <li 
                    key={subGoal.id} 
                    className="flex items-center justify-between p-1 rounded"
                  >
                    <div className="flex items-center">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                        LG{index + 1}.{subIndex + 1}
                      </span>
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
                <li className="flex items-center mt-2">
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
          onKeyPress={(e) => e.key === 'Enter' && handleAddMainGoal()}
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
        <p>This mockup shows automatic numbering (LG1, LG2, etc.) that updates when you reorder items.</p>
        <p>You can drag and drop main goals to reorder them. Changes will be saved when you save the chapter.</p>
      </div>
    </div>
  );
};

export default LearningGoalsTab;
