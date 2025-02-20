import React, { useState } from 'react';
import LeftSidebar from './ClassicLeftSidebar';
import ClassicChat from './ClassicChat';
import NoteSidebar from './ClassicNotesSidebar';
import { Chapter } from '../../../services/chatService';

interface ClassicInterfaceProps {
    chapter: Chapter;
}

const ClassicInterface: React.FC<ClassicInterfaceProps> = ({ chapter }) => {
    const [trackingContent, setTrackingContent] = useState<string>('');
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);

    const handleTrackingUpdate = (content: string, isLoading: boolean) => {
        setTrackingContent(content);
        setIsTrackingLoading(isLoading);
    };

    return (
        <div className="h-full flex">
            <div className="w-64 flex-none">
                <LeftSidebar 
                    chapter={chapter}
                    trackingContent={trackingContent}
                    isLoading={isTrackingLoading}
                />
            </div>
            <div className="flex-1 min-w-0">
                <ClassicChat 
                    chapter={chapter}
                    onTrackingUpdate={handleTrackingUpdate}
                />
            </div>
            <div className="w-80 flex-none">
                <NoteSidebar />
            </div>
        </div>
    );
};

export default ClassicInterface;
