import React from 'react';
import LeftSidebar from './ClassicLeftSidebar';
import ClassicChat from './ClassicChat';
import NoteSidebar from './ClassicNotesSidebar';
import { Chapter } from '../../../services/chatService';

interface ClassicInterfaceProps {
    chapter: Chapter;
}

const ClassicInterface: React.FC<ClassicInterfaceProps> = ({ chapter }) => {
    return (
        <div className="flex-1 flex min-h-0">
            <LeftSidebar chapter={chapter} />
            <ClassicChat chapter={chapter} />
            <NoteSidebar />
        </div>
    );
};

export default ClassicInterface;
