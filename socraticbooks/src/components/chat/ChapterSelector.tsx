import React, { useState } from 'react';
import { Chapter } from '../../services/chatService';

interface ChapterSelectorProps {
    chapters: Chapter[];
    selectedChapterId?: string;
    onChapterSelect: (chapter: Chapter) => void;
    isLoading: boolean;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
    chapters,
    selectedChapterId,
    onChapterSelect,
    isLoading
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedChapter = chapters.find(c => c.id === selectedChapterId);

    return (
        <div className="relative border-b bg-white">
            {/* Compact Header */}
            <div className="h-12 px-4 flex items-center justify-between">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 hover:bg-gray-50 rounded px-2 py-1"
                >
                    <span className="font-medium">
                        {selectedChapter ? selectedChapter.title : 'Select Chapter'}
                    </span>
                    <svg 
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {selectedChapter?.is_owner && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                        Owner
                    </span>
                )}
            </div>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border shadow-lg z-50 max-h-64 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-socratic"></div>
                        </div>
                    ) : chapters.length === 0 ? (
                        <div className="text-gray-500 text-center p-2 text-sm">
                            No chapters available
                        </div>
                    ) : (
                        <div className="p-1">
                            {chapters.map(chapter => (
                                <button
                                    key={chapter.id}
                                    onClick={() => {
                                        onChapterSelect(chapter);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left rounded text-sm transition-colors flex items-center justify-between
                                        ${selectedChapterId === chapter.id 
                                            ? 'bg-socratic text-white' 
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{chapter.title}</span>
                                    {chapter.is_owner && (
                                        <span className={`px-1.5 py-0.5 text-xs rounded
                                            ${selectedChapterId === chapter.id 
                                                ? 'bg-white text-socratic' 
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            Owner
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChapterSelector;
