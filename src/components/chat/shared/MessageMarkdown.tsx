/**
 * Shared markdown renderer for chat messages, built on Streamdown like DARE's.
 *
 * `full` is the live-chat pipeline (GFM, math, highlighted code, Mermaid)
 * used by the authenticated and public chat bubbles. `basic` is the lighter
 * read-only pipeline (GFM and math, no highlighting) used by the professor
 * conversation slide-overs, with `inverted` styling for user-side bubbles.
 * Streamdown's default rehype chain sanitizes raw HTML in model output, so
 * never override `rehypePlugins`.
 */
import React, { useMemo } from 'react';

import { createCodePlugin } from '@streamdown/code';
import { createMathPlugin } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import 'katex/dist/katex.min.css';
import { Streamdown, defaultComponents } from 'streamdown';
import type { Components, ExtraProps } from 'streamdown';

import { normalizeMathDelimiters, stripSandboxLinks } from '@/utils/markdown';

interface MessageMarkdownProps {
  content: string;
  /** Shows the streaming caret and finishes incomplete markdown as it arrives. */
  streaming?: boolean;
  /** 'sm' renders text-sm paragraphs (authenticated chat); 'base' matches the public bubble. */
  size?: 'sm' | 'base';
  /** Feature set: 'full' for live chat, 'basic' for read-only transcripts. */
  features?: 'full' | 'basic';
  /** Basic variant only: styles code/links/quotes for on-primary (user) bubbles. */
  inverted?: boolean;
}

// normalizeMathDelimiters escapes currency dollars before this parses $…$.
const math = createMathPlugin({ singleDollarTextMath: true });
const FULL_PLUGINS = {
  code: createCodePlugin({ themes: ['github-light', 'github-dark'] }),
  math,
  mermaid,
};
const BASIC_PLUGINS = { math };

const DefaultCode = defaultComponents.code;
type CodeProps = React.JSX.IntrinsicElements['code'] & ExtraProps;

const INVERTED_CARDS =
  '[&_[data-streamdown=code-block]]:text-foreground [&_[data-streamdown=table-wrapper]]:text-foreground';

const BREAK_WORD = { wordBreak: 'break-word', overflowWrap: 'break-word' } as const;

const listComponents: Components = {
  ul: ({ children, className }) => (
    <ul className={`mb-2 list-inside list-disc space-y-1 ${className ?? ''}`}>{children}</ul>
  ),
  ol: ({ children, className }) => (
    <ol className={`mb-2 list-inside list-decimal space-y-1 ${className ?? ''}`}>{children}</ol>
  ),
  li: ({ children, className }) => (
    <li className={`text-sm leading-relaxed ${className ?? ''}`}>{children}</li>
  ),
};

const link =
  (className: string): Components['a'] =>
  ({ children, href }) => (
    <a
      href={href}
      className={className}
      style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );

const basicComponents = (inverted: boolean): Components => ({
  ...listComponents,
  // Typography's prose color would override the bubble's on-primary text.
  p: ({ children }) => (
    <p
      className={`m-0 text-sm leading-relaxed break-words whitespace-pre-wrap ${
        inverted ? 'text-primary-foreground' : ''
      }`}
      style={BREAK_WORD}
    >
      {children}
    </p>
  ),
  a: link(inverted ? 'text-primary-foreground/90 underline' : 'text-primary hover:text-primary/80'),
  // Streamdown marks fenced code with `data-block`; inline code has none.
  code: (props: CodeProps) =>
    'data-block' in props ? (
      <DefaultCode {...props} />
    ) : (
      <code
        className={`not-prose rounded border px-1 py-0.5 text-sm break-all ${
          inverted
            ? 'bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground'
            : 'bg-muted border-border text-foreground'
        }`}
      >
        {props.children}
      </code>
    ),
  blockquote: ({ children }) => (
    <blockquote
      className={`my-2 border-l-4 pl-4 italic ${
        inverted
          ? 'border-primary-foreground/50 text-primary-foreground/80'
          : 'border-border text-muted-foreground'
      }`}
    >
      {children}
    </blockquote>
  ),
});

const fullComponents = (size: 'sm' | 'base'): Components => ({
  p: ({ children }) => (
    <p className={`break-words ${size === 'sm' ? 'text-sm' : ''}`} style={BREAK_WORD}>
      {children}
    </p>
  ),
  a: link('break-all'),
});

const MessageMarkdown: React.FC<MessageMarkdownProps> = ({
  content,
  streaming = false,
  size = 'sm',
  features = 'full',
  inverted = false,
}) => {
  const components = useMemo(
    () => (features === 'basic' ? basicComponents(inverted) : fullComponents(size)),
    [features, inverted, size]
  );

  if (features === 'basic') {
    return (
      <Streamdown
        mode="static"
        plugins={BASIC_PLUGINS}
        components={components}
        linkSafety={{ enabled: false }}
        // Code blocks and tables sit on a card; keep their text readable in user bubbles.
        className={inverted ? INVERTED_CARDS : undefined}
      >
        {normalizeMathDelimiters(content)}
      </Streamdown>
    );
  }

  return (
    <Streamdown
      isAnimating={streaming}
      caret={streaming ? 'block' : undefined}
      plugins={FULL_PLUGINS}
      components={components}
      linkSafety={{ enabled: false }}
      tableMaxHeight={0}
      shikiTheme={['github-light', 'github-dark']}
    >
      {normalizeMathDelimiters(stripSandboxLinks(content))}
    </Streamdown>
  );
};

export default MessageMarkdown;
