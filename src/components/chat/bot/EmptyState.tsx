import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useConversationStore } from '@/stores/core/conversationStore';

const EmptyState: React.FC = () => {
  const { currentBotId } = useConversationStore();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg">
        <MessageSquare className="h-10 w-10 text-white" />
      </div>
      <h3 className="mb-4 text-2xl font-semibold text-slate-800">Start a Conversation</h3>
      <p className="mb-8 max-w-md leading-relaxed text-slate-600">
        Ready to chat with Bot {currentBotId}! Ask me anything and I'll help you learn through our Socratic dialogue.
      </p>
    
    <div className="grid w-full max-w-md grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
        <div className="mb-1 text-sm font-medium text-slate-800">Ask Questions</div>
        <div className="text-xs text-slate-500">I'll guide you through learning</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
        <div className="mb-1 text-sm font-medium text-slate-800">Explore Ideas</div>
        <div className="text-xs text-slate-500">Let's think together</div>
      </div>
    </div>
    </div>
  );
};

export default EmptyState;