import React from 'react';
import LeftSidebar from './ClassicLeftSidebar';
import ClassicChat from './ClassicChat';
import NoteSidebar from './ClassicNotesSidebar';
import { Chapter } from '../../../services/chatService';

interface ClassicInterfaceProps {
    chapter: Chapter;
}

const ClassicInterface: React.FC<ClassicInterfaceProps> = ({ chapter }) => {

    console.log('ClassicInterface', chapter);

    return (
        <div className="h-full flex">
            <div className="w-64 flex-none"> {/* Changed to flex-none */}
                <LeftSidebar chapter={chapter} />
            </div>
            <div className="flex-1 min-w-0"> {/* Keep this as is */}
                <ClassicChat chapter={chapter} />
            </div>
            <div className="w-80 flex-none"> {/* Changed to flex-none */}
                <NoteSidebar />
            </div>
        </div>
    );
};

export default ClassicInterface;
