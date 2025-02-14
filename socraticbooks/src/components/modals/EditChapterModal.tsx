// src/components/modals/EditChapterModal.tsx
import React, { useState, useEffect } from 'react';
import { Chapter } from '../../services/chaptersService';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LearningGoals from '../chapter/LearningGoals';

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="border-b p-2 space-x-2">
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBold().run();
                }}
                className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            >
                Bold
            </button>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleItalic().run();
                }}
                className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            >
                Italic
            </button>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleStrike().run();
                }}
                className={`px-2 py-1 rounded ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
            >
                Strike
            </button>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBulletList().run();
                }}
                className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            >
                Bullet List
            </button>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleOrderedList().run();
                }}
                className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            >
                Ordered List
            </button>
        </div>
    );
};

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
    }) => void;
}

type AdvancedField = 'greeting' | 'teaching_style' | 'qa_instructions' | 'restrictions';

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
    const [selectedAdvancedField, setSelectedAdvancedField] = useState<AdvancedField>('greeting');
    const [advancedFields, setAdvancedFields] = useState<AdvancedFields>({
        greeting: '',
        teaching_style: '',
        qa_instructions: '',
        restrictions: ''
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: '',
        editable: true,
        onUpdate: ({ editor }) => {
            handleAdvancedValueChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'min-h-[200px] focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl p-4',
            },
        },
    });

    useEffect(() => {
        if (editor && advancedFields[selectedAdvancedField]) {
            editor.commands.setContent(advancedFields[selectedAdvancedField]);
        }
    }, [selectedAdvancedField, editor]);

    useEffect(() => {
        if (chapter && editor) {
            setTitle(chapter.title || '');
            setSubject(chapter.subject || '');
            setTopic(chapter.topic || '');
            const newAdvancedFields = {
                greeting: chapter.greeting || '',
                teaching_style: chapter.teaching_style || '',
                qa_instructions: chapter.qa_instructions || '',
                restrictions: chapter.restrictions || ''
            };
            setAdvancedFields(newAdvancedFields);
            editor.commands.setContent(newAdvancedFields[selectedAdvancedField]);
        }
    }, [chapter, editor]);

    const handleAdvancedValueChange = (value: string) => {
        setAdvancedFields(prev => ({
            ...prev,
            [selectedAdvancedField]: value
        }));
    };

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
                            ...advancedFields
                        });
                    }
                }}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Edit Chapter</h2>
                        
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex">
                                {['Basic Info', 'Advanced Settings', 'Learning Goals'].map((tab, index) => (
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
                                <div className="space-y-4">
                                    <select
                                        value={selectedAdvancedField}
                                        onChange={(e) => {
                                            setSelectedAdvancedField(e.target.value as AdvancedField);
                                            if (editor) {
                                                editor.commands.setContent(advancedFields[e.target.value as AdvancedField]);
                                            }
                                        }}
                                        className="w-full p-2 border rounded mb-4 focus:ring-socratic focus:border-socratic"
                                    >
                                        <option value="greeting">Greeting</option>
                                        <option value="teaching_style">Teaching Style</option>
                                        <option value="qa_instructions">QA Instructions</option>
                                        <option value="restrictions">Restrictions</option>
                                    </select>
                                    <div className="border rounded-lg overflow-hidden bg-white">
                                        <MenuBar editor={editor} />
                                        <div className="border-t">
                                            <EditorContent editor={editor} className="prose max-w-none" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentTab === 2 && (
                                <LearningGoals chapterId={chapter?.id || ''} />
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
