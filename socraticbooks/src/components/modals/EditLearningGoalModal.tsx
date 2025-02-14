// EditLearningGoalModal.tsx
import { useState, useEffect } from 'react';
import { LearningGoal } from '../../services/learningGoalsService';

interface EditLearningGoalModalProps {
    open: boolean;
    goal: LearningGoal | null;
    onClose: () => void;
    onSubmit: (goalId: string, text: string) => void;
}

const EditLearningGoalModal: React.FC<EditLearningGoalModalProps> = ({ 
    open, 
    goal, 
    onClose, 
    onSubmit 
}) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (goal) {
            setText(goal.text);
        }
    }, [goal]);

    if (!open || !goal) return null;

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit(goal.id, text);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Edit Learning Goal</h2>
                <div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-2 border rounded mb-4 h-32 focus:ring-socratic focus:border-socratic"
                        placeholder="Enter learning goal text..."
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-socratic text-white rounded hover:bg-socratic-dark"
                            disabled={!text.trim()}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditLearningGoalModal;
