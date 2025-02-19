import React from 'react';
import LeftSidebar from './LeftSidebar';
import MainChat from './MainChat';
import NoteSidebar from './NoteSidebar';
import { Chapter } from '../../services/chatService';

interface NewInterfaceProps {
    chapter: Chapter;
}

const NewInterface: React.FC<NewInterfaceProps> = ({ chapter }) => {
    return (
        <div className="flex-1 p-4 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 h-full">
                <div className="col-span-3 bg-white rounded-lg shadow-sm overflow-hidden">
                    <LeftSidebar chapter={chapter} />
                </div>
                <div className="col-span-6 bg-white rounded-lg shadow-sm overflow-hidden">
                    <MainChat chapter={chapter} />
                </div>
                <div className="col-span-3 bg-white rounded-lg shadow-sm overflow-hidden">
                    <NoteSidebar />
                </div>
            </div>
        </div>
    );
};

export default NewInterface;
