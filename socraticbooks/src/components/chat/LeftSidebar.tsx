// src/components/chat/LeftSidebar.tsx
import React from 'react';
import { Chapter } from '../../services/chatService';

interface LeftSidebarProps {
    chapter: Chapter;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ chapter }) => {
    return (
        <div className="w-64 border-r bg-white h-full overflow-y-auto">
            <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">{chapter.title}</h2>
                {/* More content will go here */}
            </div>
        </div>
    );
};

export default LeftSidebar;