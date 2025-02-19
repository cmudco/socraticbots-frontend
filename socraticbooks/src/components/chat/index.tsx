import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import ChapterSelector from './ChapterSelector';
import ClassicInterface from './ClassicInterface';
import NewInterface from './NewInterface';
import { Chapter, getAvailableChapters } from '../../services/chatService';

type InterfaceType = 'classic' | 'new';

const Chat: React.FC = () => {
    const user = useAuthContext();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [interfaceType, setInterfaceType] = useState<InterfaceType>('classic');

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
                interfaceType={interfaceType}
                onInterfaceToggle={setInterfaceType}
            />
            
            {selectedChapter ? (
                interfaceType === 'classic' ? (
                    <ClassicInterface chapter={selectedChapter} />
                ) : (
                    <NewInterface chapter={selectedChapter} />
                )
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a chapter to start chatting
                </div>
            )}
        </div>
    );
};

export default Chat;
