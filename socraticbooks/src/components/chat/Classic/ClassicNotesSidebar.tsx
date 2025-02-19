import React from 'react';

const ClassicNotesSidebar: React.FC = () => {
    return (
        <div className="w-64 border-r bg-white h-full overflow-y-auto">
            <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">Notes</h2>
                {/* More content will go here */}
            </div>
        </div>
    );
};

export default ClassicNotesSidebar;