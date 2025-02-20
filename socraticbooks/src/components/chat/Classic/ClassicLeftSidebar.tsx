// ClassicLeftSidebar.tsx
import React from 'react';
import { Chapter } from '../../../services/chatService';

interface LeftSidebarProps {
    chapter: Chapter;
    trackingContent: string;
    isLoading: boolean;
}

const ClassicLeftSidebar: React.FC<LeftSidebarProps> = ({ 
    chapter, 
    trackingContent, 
    isLoading 
}) => {
    return (
        <div className="w-64 border-r bg-white h-full overflow-y-auto">
            <div className="p-4">
                <h3 className="font-semibold text-gray-700 mb-4">
                    Learning Progress
                </h3>
                {isLoading && !trackingContent && (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                )}
                <div 
                    className="prose prose-sm space-y-2"
                    dangerouslySetInnerHTML={{ __html: trackingContent }}
                />
            </div>
        </div>
    );
};

export default ClassicLeftSidebar;
