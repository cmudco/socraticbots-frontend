import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useConversationStore } from '@/stores/core/conversationStore';

const EmptyState: React.FC = () => {
  const { currentBot } = useConversationStore();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg">
        <MessageSquare className="w-10 text-white" />
      </div>
      <h3 className="mb-4 text-2xl font-semibold text-slate-800">Start a Conversation</h3>
      <p className="mb-8 max-w-md leading-relaxed text-slate-600">
        {currentBot?.prompts?.greeting}
      </p>
    </div>
  );
};

export default EmptyState;