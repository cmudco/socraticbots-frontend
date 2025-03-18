// src/components/chapters/tabs/LearningGoalsTab.tsx
import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { addLearningGoal, removeLearningGoal } from '../../../store/slices/chapterFormSlice';
import { LearningGoal, chapterService } from '../../../services/chapters.service';
import axios from 'axios';

const LearningGoalsTab: React.FC = () => {
  const [newGoalText, setNewGoalText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hoveredGoalId, setHoveredGoalId] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();

  const isNewChapter = useAppSelector(state => !state.chapterForm.isEdit);
  
  // Get current chapter from the form state
  const chapter = useAppSelector(state => state.chapterForm.originalChapter);
  // Get current book ID from the chapters slice
  const currentBookId = useAppSelector(state => state.chapters.currentBookId);
  // Get learning goals from Redux state (already loaded in initEditChapter)
  const learningGoals = useAppSelector(state => state.chapterForm.learningGoals);
  
  const handleAddMainGoal = () => {
    if (!newGoalText.trim() || !chapter) {
      setError('Missing title or chapter information');
      return;
    }
    
    const nextOrder = learningGoals.length > 0 
      ? Math.max(...learningGoals.map(g => g.order)) + 1 
      : 1;
    
    // Create a temporary goal object
    const newGoal: LearningGoal = {
      id: `temp-${Date.now()}`, // Simple temp ID
      title: newGoalText,
      order: nextOrder,
      subgoals: [],
      chapter_id: chapter.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to Redux state only
    dispatch(addLearningGoal(newGoal));
    setNewGoalText('');
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm("Are you sure you want to delete this learning goal?")) {
      try {
        // First update the UI by removing from Redux
        dispatch(removeLearningGoal(goalId));
        
        // Only try to delete from database if it's not a temporary goal
        if (!goalId.startsWith('temp-') && chapter && currentBookId) {
          try {
            await chapterService.deleteLearningGoal(currentBookId, chapter.id, goalId);
            
            // Re-number the remaining goals
            const remainingGoals = learningGoals.filter(g => g.id !== goalId);
            
            // If we have goals left and we're not in the middle of a form reset, renumber them
            if (remainingGoals.length > 0 && chapter) {
              // Sort by current order
              const sortedGoals = [...remainingGoals].sort((a, b) => a.order - b.order);
              
              // Update each goal with new sequential order
              for (let i = 0; i < sortedGoals.length; i++) {
                const goal = sortedGoals[i];
                const newOrder = i + 1;
                
                // Only update if order changed
                if (goal.order !== newOrder) {
                  try {
                    await chapterService.updateLearningGoal(
                      currentBookId,
                      chapter.id,
                      goal.id,
                      { title: goal.title, order: newOrder }
                    );
                  } catch (updateError) {
                    console.error('Error updating goal order:', updateError);
                  }
                }
              }
            }
          } catch (error) {
            // Handle error with proper typing
            if (axios.isAxiosError(error)) {
              console.log("Database deletion error:", error.message, error.response?.status);
            } else {
              console.log("Unknown error during database deletion:", error);
            }
          }
        }
      } catch (error) {
        console.error('Error in delete process:', error);
        setError('There was an issue with the deletion process.');
      }
    }
  };
  

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Learning Goals</h3>
        {error && <div className="mt-2 text-red-500">{error}</div>}
      </div>
      
      {!chapter ? (
        // Display message when it's a new chapter
        <div className="flex items-center justify-center py-10">
          <div className="text-center p-6 bg-gray-50 rounded-lg max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">Learning Goals Not Available Yet</h3>
            <p className="text-gray-600">
              Please save the chapter first before adding learning goals.
            </p>
          </div>
        </div>
      ) : (
        // Show learning goals UI for existing chapters
        <>
          {/* Main goals list */}
          <div className="space-y-6">
            {learningGoals.length === 0 ? (
              <div className="text-gray-500 italic">No learning goals yet. Add your first goal below.</div>
            ) : (
              learningGoals.map((goal, index) => (
                <div 
                  key={goal.id} 
                  className="border rounded-lg p-4 bg-white shadow-sm transition-all hover:shadow-md relative"
                  onMouseEnter={() => setHoveredGoalId(goal.id)}
                  onMouseLeave={() => setHoveredGoalId(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                        LG{index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{goal.title}</span>
                    </div>
                    
                    {/* Delete button - only visible on hover */}
                    {hoveredGoalId === goal.id && (
                      <button 
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete learning goal"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Sub-goals count */}
                  <div className="ml-6 mt-3 text-sm text-gray-500">
                    {goal.subgoals && goal.subgoals.length > 0 ? 
                      `${goal.subgoals.length} sub-goal${goal.subgoals.length !== 1 ? 's' : ''}` : 
                      'No sub-goals'}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Add new main goal section */}
          <div className="mt-6 flex items-center">
            <input 
              type="text" 
              placeholder="Add new main goal..." 
              className="flex-1 px-3 py-2 border rounded mr-2"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddMainGoal();
              }}
            />
            <button 
              onClick={handleAddMainGoal}
              className="px-3 py-2 rounded bg-green-500 text-white hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LearningGoalsTab;
