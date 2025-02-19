import React from 'react';
import LeftSidebar from './LeftSidebar';
import MainChat from './MainChat';
import NoteSidebar from './NoteSidebar';
import { Chapter } from '../../services/chatService';

interface ClassicInterfaceProps {
    chapter: Chapter;
}

const ClassicInterface: React.FC<ClassicInterfaceProps> = ({ chapter }) => {
    return (
        <div className="flex-1 flex min-h-0">
            <LeftSidebar chapter={chapter} />
            <MainChat chapter={chapter} />
            <NoteSidebar />
        </div>
    );
};

export default ClassicInterface;
