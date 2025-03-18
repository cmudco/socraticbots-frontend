// src/components/chapters/tabs/LearningGoalsTab.tsx
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { addLearningGoal, setLearningGoals } from '../../../store/slices/chapterFormSlice';
import { chapterService, CreateLearningGoalRequest } from '../../../services/chapters.service';

const LearningGoalsTab: React.FC = () => {
  const [newGoalText, setNewGoalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  
  // Get current chapter from the form state
  const chapter = useAppSelector(state => state.chapterForm.originalChapter);
  // Get current book ID from the chapters slice
  const currentBookId = useAppSelector(state => state.chapters.currentBookId);
  const learningGoals = useAppSelector(state => state.chapterForm.learningGoals);
  
  useEffect(() => {
    if (chapter && chapter.id && currentBookId) {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching learning goals for book ${currentBookId} and chapter ${chapter.id}`);
      
      chapterService.getLearningGoals(currentBookId, chapter.id)
        .then(goals => {
          console.log('Successfully loaded goals:', goals);
          dispatch(setLearningGoals(goals));
          setIsLoading(false);
        })
        .catch(err => {
          console.error(`Failed to fetch learning goals for book ${currentBookId} and chapter ${chapter.id}:`, err);
          setError('Error loading learning goals. See console for details.');
          setIsLoading(false);
        });
    }
  }, [chapter, currentBookId, dispatch]);
  
  const handleAddMainGoal = async () => {
    if (!newGoalText.trim() || !chapter || !chapter.id || !currentBookId) {
      setError('Missing book ID or chapter ID');
      return;
    }
    
    const nextOrder = learningGoals.length > 0 
      ? Math.max(...learningGoals.map(g => g.order)) + 1 
      : 1;
    
    const goalData: CreateLearningGoalRequest = {
      title: newGoalText,
      order: nextOrder
    };
    
    setIsLoading(true);
    setError(null);
    
    console.log(`Creating learning goal for book ${currentBookId} and chapter ${chapter.id}`);
    
    try {
      const newGoal = await chapterService.createLearningGoal(currentBookId, chapter.id, goalData);
      
      console.log('Successfully created new goal:', newGoal);
      dispatch(addLearningGoal(newGoal));
      setNewGoalText('');
      setIsLoading(false);
    } catch (err) {
      console.error(`Failed to create learning goal for book ${currentBookId} and chapter ${chapter.id}:`, err);
      setError('Error creating learning goal. See console for details.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Learning Goals</h3>
        {error && <div className="mt-2 text-red-500">{error}</div>}
        {!currentBookId && <div className="mt-2 text-red-500">No book selected!</div>}
      </div>
      
      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 text-xs text-gray-600 rounded">
        <div>Current Book ID: {currentBookId || 'Not set'}</div>
        <div>Current Chapter ID: {chapter?.id || 'Not set'}</div>
      </div>
      
      {/* Main goals list */}
      <div className="space-y-6">
        {isLoading ? (
          <div>Loading goals...</div>
        ) : learningGoals.length === 0 ? (
          <div className="text-gray-500 italic">No learning goals yet. Add your first goal below.</div>
        ) : (
          learningGoals.map((goal, index) => (
            <div 
              key={goal.id} 
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                    LG{index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{goal.title}</span>
                </div>
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
          disabled={isLoading || !chapter || !currentBookId}
        />
        <button 
          onClick={handleAddMainGoal}
          className={`px-3 py-2 rounded 
            ${isLoading || !chapter || !currentBookId
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'}`}
          disabled={isLoading || !chapter || !currentBookId}
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default LearningGoalsTab;
