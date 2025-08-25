import React, { useState } from 'react';

import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
  props?: Record<string, unknown>;
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
    <div className="not-prose border-border bg-muted/50 relative my-4 rounded-lg border">
      {language && (
        <div className="border-border bg-muted flex items-center justify-between border-b px-4 py-2">
          <span className="text-muted-foreground text-xs font-medium uppercase">{language}</span>
          <button
            onClick={handleCopy}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center space-x-1 rounded px-2 py-1 text-xs transition-colors"
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
          <code className={`text-sm ${className} block break-words whitespace-pre-wrap`} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};
