// src/components/modals/AddLearningGoalModal.tsx
import { useState } from 'react';

interface AddLearningGoalModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (text: string) => void;
}

const AddLearningGoalModal: React.FC<AddLearningGoalModalProps> = ({ open, onClose, onSubmit }) => {
    const [text, setText] = useState('');

    if (!open) return null;

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit(text);
            setText('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Add Learning Goal</h2>
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
                            Add Goal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLearningGoalModal;
