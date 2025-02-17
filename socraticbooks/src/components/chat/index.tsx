import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import ChapterSidebar from './ChapterSidebar';
import { Chapter, getAvailableChapters } from '../../services/chatService';

const Chat: React.FC = () => {
    const  user  = useAuthContext();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchChapters = async () => {
            if (user?.uid) {
                try {
                    setIsLoading(true);
                    const availableChapters = await getAvailableChapters(user.uid);
                    setChapters(availableChapters);
                } catch (error) {
                    console.error('Error fetching chapters:', error);
                    // You might want to add error state and show error message
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchChapters();
    }, [user?.uid]);

    return (
        <div className="flex h-screen">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedChapter ? (
                    <div className="p-4">
                        <h2 className="text-xl font-semibold">{selectedChapter.title}</h2>
                        {/* Chat interface will go here */}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a chapter to start chatting
                    </div>
                )}
            </div>

            {/* Chapter Sidebar */}
            <ChapterSidebar
                chapters={chapters}
                selectedChapterId={selectedChapter?.id}
                onChapterSelect={setSelectedChapter}
                isLoading={isLoading}
            />
        </div>
    );
};

export default Chat;