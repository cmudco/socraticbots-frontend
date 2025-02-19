// src/components/chat/ClassicLeftSidebar
//.tsx
import React from 'react';
import { Chapter } from '../../../services/chatService';

interface LeftSidebarProps {
    chapter: Chapter;
}

const ClassicLeftSidebar: React.FC<LeftSidebarProps> = ({ chapter }) => {
    return (
        <div className="w-64 border-r bg-white h-full overflow-y-auto">
            <div className="p-4">
                
                
            </div>
        </div>
    );
};

export default ClassicLeftSidebar;