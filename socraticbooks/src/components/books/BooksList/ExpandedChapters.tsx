// src/components/books/BooksList/ExpandedChapters.tsx
import React, { useEffect, useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { getChapters, Chapter } from '../../../services/chaptersService';
import { useAuthContext } from '../../../contexts/AuthContext';

interface ExpandedChaptersProps {
    bookId: string;
}

const ExpandedChapters: React.FC<ExpandedChaptersProps> = ({ bookId }) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthContext();

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                if (user?.uid) {
                    
                    
                    const chaptersData = await getChapters(user.uid);
                    
                    
                    // Updated to use book_id instead of bookId
                    const bookChapters = chaptersData.filter(chapter => chapter.book_id === bookId);
                    
                    
                    setChapters(bookChapters);
                }
            } catch (error) {
                console.error('Error fetching chapters:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChapters();
    }, [bookId, user]);

    

    return (
        <TableRow>
            <TableCell colSpan={6} className="bg-gray-50">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Chapters</h3>
                        <button 
                            className="bg-socratic hover:bg-socratic-dark text-socratic-font-light px-3 py-1 rounded text-sm transition-colors"
                        >
                            Add Chapter
                        </button>
                    </div>
                    
                    {loading ? (
                        <div>Loading chapters...</div>
                    ) : chapters.length === 0 ? (
                        <p className="text-gray-500">
                            No chapters yet. Add your first chapter! (BookID: {bookId})
                        </p>
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
                                        <button className="text-socratic hover:text-socratic-dark">
                                            Edit
                                        </button>
                                        <button className="text-red-500 hover:text-red-700">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
};

export default ExpandedChapters;
