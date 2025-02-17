import React from 'react';
import { Chapter } from '../../services/chatService';

interface ChapterSidebarProps {
    chapters: Chapter[];
    selectedChapterId?: string;
    onChapterSelect: (chapter: Chapter) => void;
    isLoading: boolean;
}

const ChapterSidebar: React.FC<ChapterSidebarProps> = ({
    chapters,
    selectedChapterId,
    onChapterSelect,
    isLoading
}) => {
    return (
        <div className="w-80 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Available Chapters</h3>
                
                {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-socratic"></div>
                    </div>
                ) : chapters.length === 0 ? (
                    <div className="text-gray-500 text-center p-4">
                        No chapters available
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chapters.map(chapter => (
                            <button
                                key={chapter.id}
                                onClick={() => onChapterSelect(chapter)}
                                className={`w-full p-3 text-left rounded transition-colors
                                    ${selectedChapterId === chapter.id 
                                        ? 'bg-socratic text-white' 
                                        : 'hover:bg-gray-200'
                                    }`}
                            >
                                <div className="font-medium">{chapter.title}</div>
                                {chapter.is_owner && (
                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mt-1">
                                        Owner
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChapterSidebar;