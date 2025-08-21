import React from 'react';
import { Loader2 } from 'lucide-react';

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start mb-6">
    <div className="bg-white border border-slate-200 max-w-[80%] rounded-2xl px-4 py-3 mr-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-slate-600">Assistant is thinking...</span>
        </div>
      </div>
    </div>
  </div>
);

export default TypingIndicator;