import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
  props?: any;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="not-prose relative my-4 rounded-lg border border-slate-200 bg-slate-50">
      {language && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2">
          <span className="text-xs font-medium text-slate-600 uppercase">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 rounded bg-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-300 transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <pre className="p-4">
          <code
            className={`text-sm ${className} block whitespace-pre-wrap break-words`}
            {...props}
          >
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};
