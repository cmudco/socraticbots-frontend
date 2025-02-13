// src/components/books/BooksList/ExpandedChapters.tsx
import React, { useEffect, useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { getChapters, Chapter, createChapter, updateChapter, deleteChapter } from '../../../services/chaptersService';
import { useAuthContext } from '../../../contexts/AuthContext';
import CreateChapterModal from '../../modals/CreateChapterModal';
import EditChapterModal from '../../modals/EditChapterModal';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import DOMPurify from 'dompurify';

interface ExpandedChaptersProps {
    bookId: string;
}

const ExpandedChapters: React.FC<ExpandedChaptersProps> = ({ bookId }) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const user = useAuthContext();

    useEffect(() => {
        fetchChapters();
    }, [bookId, user]);

    const fetchChapters = async () => {
        try {
            if (user?.uid) {
                const chaptersData = await getChapters(user.uid);
                const bookChapters = chaptersData.filter(chapter => chapter.book_id === bookId);
                setChapters(bookChapters);
            }
        } catch (error) {
            console.error('Error fetching chapters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChapter = async (title: string, subject: string, topic: string) => {
        try {
            if (user?.uid) {
                const newChapter = await createChapter({
                    title,
                    subject,
                    topic,
                    bookId,
                    userId: user.uid
                });
                setChapters([...chapters, newChapter]);
                setOpenCreateModal(false);
            }
        } catch (error) {
            console.error('Error creating chapter:', error);
        }
    };

    const handleUpdateChapter = async (
        chapterId: string,
        data: {
            title: string;
            subject: string;
            topic: string;
            greeting?: string;
            teaching_style?: string;
            qa_instructions?: string;
            restrictions?: string;
        }
    ) => {
        try {
            if (user?.uid) {
                const updatedChapter = await updateChapter(user.uid, chapterId, data);
                setChapters(chapters.map(chapter => 
                    chapter.id === chapterId ? updatedChapter : chapter
                ));
                setOpenEditModal(false);
                setSelectedChapter(null);
            }
        } catch (error) {
            console.error('Error updating chapter:', error);
        }
    };

    const handleDeleteChapter = async (chapterId: string) => {
        if (window.confirm('Are you sure you want to delete this chapter?')) {
            try {
                if (user?.uid) {
                    await deleteChapter(user.uid, chapterId);
                    setChapters(chapters.filter(chapter => chapter.id !== chapterId));
                }
            } catch (error) {
                console.error('Error deleting chapter:', error);
            }
        }
    };

    return (
        <TableRow>
            <TableCell colSpan={6} className="bg-gray-50">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Chapters</h3>
                        <button 
                            onClick={() => setOpenCreateModal(true)}
                            className="bg-socratic hover:bg-socratic-dark text-socratic-font-light px-3 py-1 rounded text-sm transition-colors"
                        >
                            Add Chapter
                        </button>
                    </div>
                    
                    {loading ? (
                        <div>Loading chapters...</div>
                    ) : chapters.length === 0 ? (
                        <p className="text-gray-500">No chapters yet. Add your first chapter!</p>
                    ) : (
                        <div className="space-y-2">
                            {chapters.map((chapter) => (
                                <div 
                                    key={chapter.id}
                                    className="flex items-center justify-between p-3 bg-white rounded shadow-sm"
                                >
                                    <div className="w-full">
                                        <h4 className="font-medium">{chapter.title}</h4>
                                        {(chapter.subject || chapter.topic) && (
                                            <p className="text-sm text-gray-600">
                                                {chapter.subject && <span>Subject: {chapter.subject}</span>}
                                                {chapter.subject && chapter.topic && <span> • </span>}
                                                {chapter.topic && <span>Topic: {chapter.topic}</span>}
                                            </p>
                                        )}
                                        {/* Preview of rich text content */}
                                        {(chapter.greeting || chapter.teaching_style || 
                                          chapter.qa_instructions || chapter.restrictions) && (
                                            <div className="mt-2 border-t pt-2">
                                                {chapter.greeting && (
                                                    <div className="text-sm mt-1">
                                                        <span className="font-medium">Greeting:</span>
                                                        <div 
                                                            className="prose prose-sm max-w-none ml-2 mt-1"
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: DOMPurify.sanitize(chapter.greeting) 
                                                            }} 
                                                        />
                                                    </div>
                                                )}
                                                {chapter.teaching_style && (
                                                    <div className="text-sm mt-1">
                                                        <span className="font-medium">Teaching Style:</span>
                                                        <div 
                                                            className="prose prose-sm max-w-none ml-2 mt-1"
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: DOMPurify.sanitize(chapter.teaching_style) 
                                                            }} 
                                                        />
                                                    </div>
                                                )}
                                                {chapter.qa_instructions && (
                                                    <div className="text-sm mt-1">
                                                        <span className="font-medium">QA Instructions:</span>
                                                        <div 
                                                            className="prose prose-sm max-w-none ml-2 mt-1"
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: DOMPurify.sanitize(chapter.qa_instructions) 
                                                            }} 
                                                        />
                                                    </div>
                                                )}
                                                {chapter.restrictions && (
                                                    <div className="text-sm mt-1">
                                                        <span className="font-medium">Restrictions:</span>
                                                        <div 
                                                            className="prose prose-sm max-w-none ml-2 mt-1"
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: DOMPurify.sanitize(chapter.restrictions) 
                                                            }} 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button 
                                            onClick={() => {
                                                setSelectedChapter(chapter);
                                                setOpenEditModal(true);
                                            }}
                                            className="text-socratic hover:text-socratic-dark"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteChapter(chapter.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <CreateChapterModal 
                    open={openCreateModal}
                    bookId={bookId}
                    onClose={() => setOpenCreateModal(false)}
                    onSubmit={handleCreateChapter}
                />

                <EditChapterModal 
                    open={openEditModal}
                    chapter={selectedChapter}
                    onClose={() => {
                        setOpenEditModal(false);
                        setSelectedChapter(null);
                    }}
                    onSubmit={handleUpdateChapter}
                />
            </TableCell>
        </TableRow>
    );
};

export default ExpandedChapters;
