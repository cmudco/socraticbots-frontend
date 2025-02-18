import React, { useState, useEffect } from 'react';
import { Chapter } from '../../services/chaptersService';
import LearningGoals from '../chapter/LearningGoals';
import Files from '../chapter/Files';
import Deployment from '../chapter/Deployment';
import AdvancedSettings from '../chapter/AdvancedSettings';
import { getChapterFilesAndTags } from '../../services/chaptersService';

interface EditChapterModalProps {
    open: boolean;
    chapter: Chapter | null;
    onClose: () => void;
    onSubmit: (chapterId: string, data: {
        title: string;
        subject: string;
        topic: string;
        greeting?: string;
        teaching_style?: string;
        qa_instructions?: string;
        restrictions?: string;
        selectedFiles: string[];
        selectedTags: string[];
    }) => void;
}

interface AdvancedFields {
    greeting: string;
    teaching_style: string;
    qa_instructions: string;
    restrictions: string;
}

const EditChapterModal: React.FC<EditChapterModalProps> = ({
    open,
    chapter,
    onClose,
    onSubmit,
}) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [advancedFields, setAdvancedFields] = useState<AdvancedFields>({
        greeting: '',
        teaching_style: '',
        qa_instructions: '',
        restrictions: ''
    });
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Reset selections when modal opens/closes
    useEffect(() => {
        if (open && chapter) {
            setTitle(chapter.title || '');
            setSubject(chapter.subject || '');
            setTopic(chapter.topic || '');
            setAdvancedFields({
                greeting: chapter.greeting || '',
                teaching_style: chapter.teaching_style || '',
                qa_instructions: chapter.qa_instructions || '',
                restrictions: chapter.restrictions || ''
            });

            // Load existing files and tags
            const loadFilesAndTags = async () => {
                try {
                    const { fileIds, tags } = await getChapterFilesAndTags(chapter.id);
                    setSelectedFiles(fileIds);
                    setSelectedTags(tags);
                } catch (error) {
                    console.error('Error loading files and tags:', error);
                }
            };
            loadFilesAndTags();
        }
    }, [open, chapter]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (chapter) {
                        onSubmit(chapter.id, {
                            title,
                            subject,
                            topic,
                            ...advancedFields,
                            selectedFiles,
                            selectedTags,
                        });
                    }
                }}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Edit Chapter</h2>
                        
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex">
                            {['Basic Info', 'Advanced Settings', 'Learning Goals', 'Files', 'Deployment'].map((tab, index) => (
                                <button
                                    key={tab}
                                    type="button"
                                    className={`mr-2 py-2 px-4 border-b-2 ${
                                        currentTab === index
                                            ? 'border-socratic text-socratic'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setCurrentTab(index)}
                                >
                                    {tab}
                                </button>
                            ))}
                            </nav>
                        </div>

                        <div className="mt-6">
                            {currentTab === 0 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full p-2 border rounded focus:ring-socratic focus:border-socratic"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full p-2 border rounded focus:ring-socratic focus:border-socratic"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Topic
                                        </label>
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="w-full p-2 border rounded focus:ring-socratic focus:border-socratic"
                                        />
                                    </div>
                                </div>
                            )}

                            {currentTab === 1 && (
                                <AdvancedSettings
                                    advancedFields={advancedFields}
                                    onFieldChange={(field, value) => {
                                        setAdvancedFields(prev => ({
                                            ...prev,
                                            [field]: value
                                        }));
                                    }}
                                />
                            )}

                            {currentTab === 2 && (
                                <LearningGoals chapterId={chapter?.id || ''} />
                            )}

                            {currentTab === 3 && (
                                <Files 
                                    chapterId={chapter?.id || ''}
                                    selectedFiles={selectedFiles}
                                    selectedTags={selectedTags}
                                    onFileSelect={setSelectedFiles}
                                    onTagSelect={setSelectedTags}
                                />
                            )}

                            {currentTab === 4 && (
                                <Deployment chapterId={chapter?.id || ''} />
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-2 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-socratic text-white rounded hover:bg-socratic-dark"
                            disabled={!title}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditChapterModal;
