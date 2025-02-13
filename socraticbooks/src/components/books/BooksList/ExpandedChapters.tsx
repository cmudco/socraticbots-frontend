import React, { useEffect, useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { getChapters } from '../../../services/chaptersService'; // You'll need to create this

interface Chapter {
    id: string;
    bookId: string;
    title: string;
    description?: string;
    order: number;
    created_at?: string;
    updated_at?: string;
}

interface ExpandedChaptersProps {
    bookId: string;
}

const ExpandedChapters: React.FC<ExpandedChaptersProps> = ({ bookId }) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const chaptersData = await getChapters(bookId);
                setChapters(chaptersData);
            } catch (error) {
                console.error('Error fetching chapters:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChapters();
    }, [bookId]);

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
                                        {chapter.description && (
                                            <p className="text-sm text-gray-600">{chapter.description}</p>
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
