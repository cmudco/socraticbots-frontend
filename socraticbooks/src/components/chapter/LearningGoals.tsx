import { useState, useEffect } from 'react';
import { getLearningGoals, createLearningGoal, updateLearningGoal, deleteLearningGoal, LearningGoal } from '../../services/learningGoalsService';
import AddLearningGoalModal from '../modals/AddLearningGoalModal';
import EditLearningGoalModal from '../modals/EditLearningGoalModal';

interface LearningGoalsProps {
    chapterId: string;
}

const LearningGoals: React.FC<LearningGoalsProps> = ({ chapterId }) => {
    const [goals, setGoals] = useState<LearningGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const data = await getLearningGoals(chapterId);
            setGoals(data);
            setError(null);
        } catch (err) {
            setError('Failed to load learning goals');
            console.error('Error loading goals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chapterId) {
            fetchGoals();
        }
    }, [chapterId]);

    const handleAddGoal = async (text: string) => {
        try {
            await createLearningGoal(chapterId, { text });
            setIsAddModalOpen(false);
            fetchGoals();
        } catch (err) {
            setError('Failed to create learning goal');
            console.error('Error creating goal:', err);
        }
    };

    const handleEditGoal = async (goalId: string, text: string) => {
        try {
            await updateLearningGoal(goalId, { text });
            setIsEditModalOpen(false);
            setSelectedGoal(null);
            await fetchGoals(); // Re-fetch goals after update
        } catch (err) {
            setError('Failed to update learning goal');
            console.error('Error updating goal:', err);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (window.confirm('Are you sure you want to delete this learning goal?')) {
            try {
                await deleteLearningGoal(goalId);
                fetchGoals();
            } catch (err) {
                setError('Failed to delete learning goal');
                console.error('Error deleting goal:', err);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading learning goals...</div>;
    }

    if (error) {
        return <div className="text-red-600 py-4">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Learning Goals</h3>
                <button
                    type="button"
                    className="px-4 py-2 bg-socratic text-white rounded hover:bg-socratic-dark"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add Goal
                </button>
            </div>
            
            {goals.map((goal, index) => (
                <div key={goal.id} className="p-4 border rounded">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="font-medium">Goal {index + 1}</div>
                            <div className="mt-1">{goal.text}</div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                className="text-gray-600 hover:text-gray-900"
                                onClick={() => {
                                    setSelectedGoal(goal);
                                    setIsEditModalOpen(true);
                                }}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteGoal(goal.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            
            {goals.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No learning goals yet. Click "Add Goal" to create one.
                </div>
            )}

            <AddLearningGoalModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddGoal}
            />

            <EditLearningGoalModal
                open={isEditModalOpen}
                goal={selectedGoal}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedGoal(null);
                }}
                onSubmit={handleEditGoal}
            />
        </div>
    );
};

export default LearningGoals;
