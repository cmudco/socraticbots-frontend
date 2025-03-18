// src/components/chapters/tabs/LearningGoalsTab.tsx
import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { addLearningGoal, removeLearningGoal, addSubGoal, removeSubGoal } from '../../../store/slices/chapterFormSlice';
import { LearningGoal, chapterService, SubGoal } from '../../../services/chapters.service';
import axios from 'axios';

const LearningGoalsTab: React.FC = () => {
  const [newGoalText, setNewGoalText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hoveredGoalId, setHoveredGoalId] = useState<string | null>(null);
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set());
  const [newSubgoalTexts, setNewSubgoalTexts] = useState<Record<string, string>>({});
  
  const dispatch = useAppDispatch();

  const isNewChapter = useAppSelector(state => !state.chapterForm.isEdit);
  
  // Get current chapter from the form state
  const chapter = useAppSelector(state => state.chapterForm.originalChapter);
  // Get current book ID from the chapters slice
  const currentBookId = useAppSelector(state => state.chapters.currentBookId);
  // Get learning goals from Redux state (already loaded in initEditChapter)
  const learningGoals = useAppSelector(state => state.chapterForm.learningGoals);
  
  // Function to toggle goal expansion
  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoalIds(prevState => {
      const newState = new Set(prevState);
      if (newState.has(goalId)) {
        newState.delete(goalId);
      } else {
        newState.add(goalId);
      }
      return newState;
    });
  };
  
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

  const handleAddSubgoal = async (learningGoalId: string) => {
    const subgoalText = newSubgoalTexts[learningGoalId] || '';
    if (!subgoalText.trim() || !chapter || !currentBookId) {
      setError('Missing subgoal title or chapter information');
      return;
    }
    
    const learningGoal = learningGoals.find(g => g.id === learningGoalId);
    if (!learningGoal) {
      console.error('Learning goal not found');
      return;
    }
    
    // Calculate next order
    const nextOrder = learningGoal.subgoals && learningGoal.subgoals.length > 0
      ? Math.max(...learningGoal.subgoals.map(sg => sg.order)) + 1
      : 1;
    
    try {
      let newSubgoal: SubGoal;
      
      // If the learning goal is temporary, just create a temp subgoal
      if (learningGoalId.startsWith('temp-')) {
        newSubgoal = {
          id: `temp-sub-${Date.now()}`,
          title: subgoalText,
          order: nextOrder,
          parent_goal_id: learningGoalId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else {
        // Otherwise, create the subgoal in the database
        const response = await chapterService.createSubGoal(
          currentBookId,
          chapter.id,
          learningGoalId,
          { title: subgoalText, order: nextOrder }
        );
        
        newSubgoal = {
          id: response.id,
          title: response.title,
          order: response.order,
          parent_goal_id: learningGoalId,
          created_at: response.created_at,
          updated_at: response.updated_at
        };
      }
      
      // Add to Redux
      dispatch(addSubGoal({ learningGoalId, subgoal: newSubgoal }));
      
      // Clear input
      setNewSubgoalTexts(prev => ({
        ...prev,
        [learningGoalId]: ''
      }));
      setError(null);
    } catch (error) {
      console.error('Error adding subgoal:', error);
      setError('Failed to add subgoal');
    }
  };
  
  const handleDeleteSubgoal = async (learningGoalId: string, subgoalId: string) => {
    if (window.confirm("Are you sure you want to delete this subgoal?")) {
      try {
        // First update the UI by removing from Redux
        dispatch(removeSubGoal({ learningGoalId, subgoalId }));
        
        // Only try to delete from database if it's not a temporary subgoal
        if (!subgoalId.startsWith('temp-') && chapter && currentBookId) {
          try {
            await chapterService.deleteSubGoal(
              currentBookId,
              chapter.id,
              learningGoalId,
              subgoalId
            );
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
                    <div 
                      className="flex items-center cursor-pointer" 
                      onClick={() => toggleGoalExpansion(goal.id)}
                    >
                      <span className="mr-2 text-gray-500">
                        {expandedGoalIds.has(goal.id) ? 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg> : 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        }
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                        LG{index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{goal.title}</span>
                    </div>
                    
                    {/* Delete button - only visible on hover */}
                    {hoveredGoalId === goal.id && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent expansion toggle
                          handleDeleteGoal(goal.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete learning goal"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Subgoals section - only visible when expanded */}
                  {expandedGoalIds.has(goal.id) ? (
                    <div className="ml-8 mt-3 space-y-3">
                      {/* Subgoals list */}
                      {goal.subgoals && goal.subgoals.length > 0 ? (
                        <div className="space-y-2">
                          {goal.subgoals.map((subgoal, subIndex) => (
                            <div key={subgoal.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div className="flex items-center">
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium mr-2">
                                  {index + 1}.{subIndex + 1}
                                </span>
                                <span>{subgoal.title}</span>
                              </div>
                              
                              {/* Subgoal delete button */}
                              <button 
                                onClick={() => handleDeleteSubgoal(goal.id, subgoal.id)}
                                className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Delete subgoal"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 italic text-sm">No subgoals yet</div>
                      )}
                      
                      {/* Add subgoal input */}
                      <div className="flex mt-2">
                        <input
                          type="text"
                          placeholder="Add new subgoal..."
                          className="flex-1 px-3 py-1 text-sm border rounded-l"
                          value={newSubgoalTexts[goal.id] || ''}
                          onChange={(e) => setNewSubgoalTexts(prev => ({
                            ...prev,
                            [goal.id]: e.target.value
                          }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleAddSubgoal(goal.id);
                          }}
                        />
                        <button
                          onClick={() => handleAddSubgoal(goal.id)}
                          className="px-3 py-1 rounded-r bg-blue-500 text-white hover:bg-blue-600 text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    // When collapsed, show just the subgoal count
                    <div className="ml-8 mt-1 text-sm text-gray-500">
                      {goal.subgoals && goal.subgoals.length > 0 ? 
                        `${goal.subgoals.length} sub-goal${goal.subgoals.length !== 1 ? 's' : ''}` : 
                        'No sub-goals'}
                    </div>
                  )}
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
