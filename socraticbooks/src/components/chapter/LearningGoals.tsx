import { useState, useEffect } from 'react';
import { getLearningGoals, LearningGoal } from '../../services/learningGoalsService';

interface LearningGoalsProps {
    chapterId: string;
}

const LearningGoals: React.FC<LearningGoalsProps> = ({ chapterId }) => {
    const [goals, setGoals] = useState<LearningGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

        if (chapterId) {
            fetchGoals();
        }
    }, [chapterId]);

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
                    onClick={() => {/* TODO: Add new goal handler */}}
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
                                onClick={() => {/* TODO: Edit handler */}}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => {/* TODO: Delete handler */}}
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
        </div>
    );
};

export default LearningGoals;
