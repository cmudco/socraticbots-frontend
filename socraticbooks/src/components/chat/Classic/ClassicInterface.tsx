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
        <div className="flex-1 flex min-h-0">
            <div className="w-64 flex-shrink-0"> {/* Fixed width for left sidebar */}
                <LeftSidebar chapter={chapter} />
            </div>
            <div className="flex-1 min-w-0"> {/* Chat area with min-w-0 to prevent overflow */}
                <ClassicChat chapter={chapter} />
            </div>
            <div className="w-80 flex-shrink-0"> {/* Fixed width for notes */}
                <NoteSidebar />
            </div>
        </div>
    );
};

export default ClassicInterface;
