import React, { useState } from 'react';

const ClassicNotesSidebar: React.FC = () => {
    const [notes, setNotes] = useState<string>('');

    const handleSaveNotes = () => {
        // Will implement save functionality later
        console.log('Saving notes:', notes);
    };

    return (
        <div className="w-80 border-l bg-white h-full flex flex-col m-0 p-1"> 
            <div className="p-4 border-b flex items-center justify-between"> 
                <h2 className="font-semibold text-lg">Notes</h2> 
                <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-socratic text-socratic-font-light text-sm rounded-md hover:bg-socratic-dark transition-colors"
                >
                    Save Notes
                </button>
            </div>
            <div className="flex-1 p-4 m-0"> {/* Added m-0 */}
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-full resize-none border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-socratic focus:border-transparent m-0" 
                    placeholder="Type your notes here..."
                />
            </div>
        </div>
    );
};

export default ClassicNotesSidebar;
