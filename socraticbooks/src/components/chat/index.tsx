import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import ChapterSelector from './ChapterSelector';
import LeftSidebar from './LeftSidebar';
import MainChat from './MainChat';
import NoteSidebar from './NoteSidebar';
import { Chapter, getAvailableChapters } from '../../services/chatService';

const Chat: React.FC = () => {
    const user  = useAuthContext();
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
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchChapters();
    }, [user?.uid]);

    return (
        <div className="h-screen flex flex-col">
            <ChapterSelector
                chapters={chapters}
                selectedChapterId={selectedChapter?.id}
                onChapterSelect={setSelectedChapter}
                isLoading={isLoading}
            />

            {selectedChapter ? (
                <div className="flex-1 flex min-h-0"> {/* added min-h-0 here */}
                    <LeftSidebar chapter={selectedChapter} />
                    <MainChat chapter={selectedChapter} />
                    <NoteSidebar />
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a chapter to start chatting
                </div>
            )}
        </div>
    );
};

export default Chat;