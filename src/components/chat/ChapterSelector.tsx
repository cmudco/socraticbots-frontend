import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAvailableChapters, useChapterToBookMapping } from '@/hooks/queries/useChat';
import { useChatStore } from '@/stores/chatStore';
import { api } from '@/services/api/instance';

const ChapterSelector: React.FC = () => {
    const { data: chapters, isLoading } = useAvailableChapters();
    const { data: chapterToBookMapping } = useChapterToBookMapping();
    const { selectedChapterId, setChapterContext, setSelectedChapterId, clearChatState } = useChatStore();

    const handleChapterChange = async (chapterId: string) => {
        // Clear existing chat state
        clearChatState();

        try {
            // Get book ID from mapping
            const bookId = chapterToBookMapping?.[chapterId];

            if (bookId) {
                // Get the conversation for this chapter
                try {
                    const conversationResponse = await api.get(`/chat/conversations/for_chapter/${chapterId}/`);
                    const conversation = conversationResponse.data;
                    setChapterContext(bookId, chapterId, conversation.id);
                    return;
                } catch (error) {
                    console.warn('Could not fetch conversation for chapter:', error);
                }

                // Set chapter context without conversation ID if conversation fetch fails
                setChapterContext(bookId, chapterId, '');
            } else {
                // If we can't find the book in the mapping, just set the chapter ID
                // The learning goals won't work, but at least the chat can function
                console.warn('Could not find book for chapter in mapping:', chapterId);
                setSelectedChapterId(chapterId);
            }
        } catch (error) {
            console.error('Error in handleChapterChange:', error);
            // Fallback to just setting chapter ID
            setSelectedChapterId(chapterId);
        }
    };

    if (isLoading) {
        return (
            <div className="w-64">
                <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="w-64">
            <Select value={selectedChapterId || ''} onValueChange={handleChapterChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a chapter..." />
                </SelectTrigger>
                <SelectContent>
                    {chapters?.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                            <div className="flex flex-col">
                                <span className="font-medium">{chapter.title}</span>
                                {chapter.subject && (
                                    <span className="text-xs text-gray-500">{chapter.subject}</span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default ChapterSelector;