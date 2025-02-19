import React from 'react';

import { Chapter } from '../../../services/chatService';

interface NewInterfaceProps {
    chapter: Chapter;
}

const NewInterface: React.FC<NewInterfaceProps> = ({ chapter }) => {
    return (
        <div className="flex-1 p-4 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 h-full">
                
            </div>
        </div>
    );
};

export default NewInterface;
