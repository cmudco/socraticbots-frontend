// src/components/books/BooksList/ExpandedChapters.tsx
import React, { useEffect, useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { 
    getChapters, 
    getChapter, 
    Chapter, 
    createChapter, 
    updateChapter, 
    deleteChapter,
    updateChapterFilesAndTags,
    getChapterFilesAndTags,
    ChapterFilesAndTags
} from '../../../services/chaptersService';
import { useAuthContext } from '../../../contexts/AuthContext';
import CreateChapterModal from '../../modals/CreateChapterModal';
import EditChapterModal from '../../modals/EditChapterModal';

type ChapterFilesAndTagsType = ChapterFilesAndTags;
if (false) console.log({} as ChapterFilesAndTagsType); // Placeholder to prevent unused variable error

interface ExpandedChaptersProps {
    bookId: string;
}

interface ExtendedChapter extends Chapter {
    selectedFiles?: string[];
    selectedTags?: string[];
}

const ExpandedChapters: React.FC<ExpandedChaptersProps> = ({ bookId }) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<ExtendedChapter | null>(null);
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

    const fetchSingleChapter = async (chapterId: string) => {
        try {
            if (user?.uid) {
                const [chapterData, filesAndTags] = await Promise.all([
                    getChapter(user.uid, chapterId),
                    getChapterFilesAndTags(chapterId)
                ]);
                
                const extendedChapter: ExtendedChapter = {
                    ...chapterData,
                    selectedFiles: filesAndTags.fileIds,
                    selectedTags: filesAndTags.tags
                };
                
                setSelectedChapter(extendedChapter);
            }
        } catch (error) {
            console.error('Error fetching single chapter:', error);
        }
    };

    const handleEditClick = async (chapter: Chapter) => {
        console.log('Edit clicked for chapter:', chapter);
        await fetchSingleChapter(chapter.id);
        setOpenEditModal(true);
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
            selectedFiles: string[];
            selectedTags: string[];
        }
    ) => {
        try {
            if (user?.uid) {
                const { selectedFiles, selectedTags, ...chapterData } = data;
                
                // Update chapter basic info
                const updatedChapter = await updateChapter(user.uid, chapterId, chapterData);

                // Update files and tags
                await updateChapterFilesAndTags(
                    chapterId,
                    selectedFiles,
                    selectedTags
                );

                // Update local state
                setChapters(chapters.map(chapter => 
                    chapter.id === chapterId ? updatedChapter : chapter
                ));
                setOpenEditModal(false);
                setSelectedChapter(null);
                
                // Refresh to get latest data
                fetchChapters();
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
            <TableCell colSpan={6} className="bg-gray-200">
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
                                    <div>
                                        <h4 className="font-medium">{chapter.title}</h4>
                                        {(chapter.subject || chapter.topic) && (
                                            <p className="text-sm text-gray-600">
                                                {chapter.subject && <span>Subject: {chapter.subject}</span>}
                                                {chapter.subject && chapter.topic && <span> • </span>}
                                                {chapter.topic && <span>Topic: {chapter.topic}</span>}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEditClick(chapter)}
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
                        fetchChapters(); // Refresh the list after closing
                    }}
                    onSubmit={handleUpdateChapter}
                />
            </TableCell>
        </TableRow>
    );
};

export default ExpandedChapters;
