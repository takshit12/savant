'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

// Define component props type
type ComponentPropsType = {
  node?: any;
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
} & React.HTMLAttributes<HTMLElement>;

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Define components with proper TypeScript types
  const components: Components = {
    // Style headers
    h1: ({ children, ...props }: ComponentPropsType) => (
      <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: ComponentPropsType) => (
      <h2 className="text-xl font-bold mt-5 mb-3" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: ComponentPropsType) => (
      <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>
    ),
    h4: ({ children, ...props }: ComponentPropsType) => (
      <h4 className="text-base font-bold mt-3 mb-2" {...props}>{children}</h4>
    ),
    
    // Style paragraphs and lists
    p: ({ children, ...props }: ComponentPropsType) => (
      <p className="my-2" {...props}>{children}</p>
    ),
    ul: ({ children, ...props }: ComponentPropsType) => (
      <ul className="list-disc ml-6 my-2" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: ComponentPropsType) => (
      <ol className="list-decimal ml-6 my-2" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: ComponentPropsType) => (
      <li className="my-1" {...props}>{children}</li>
    ),
    
    // Style code blocks and inline code
    code: ({ inline, className, children, ...props }: ComponentPropsType) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          // @ts-ignore - vscDarkPlus type is not properly recognized
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="rounded-md my-4"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-100 rounded px-1 py-0.5" {...props}>
          {children}
        </code>
      );
    },
    
    // Style blockquotes
    blockquote: ({ children, ...props }: ComponentPropsType) => (
      <blockquote 
        className="border-l-4 border-gray-300 pl-4 my-4 italic"
        {...props}
      >
        {children}
      </blockquote>
    ),
    
    // Style emphasis and strong text
    em: ({ children, ...props }: ComponentPropsType) => (
      <em className="italic" {...props}>{children}</em>
    ),
    strong: ({ children, ...props }: ComponentPropsType) => (
      <strong className="font-bold" {...props}>{children}</strong>
    ),
    
    // Style tables
    table: ({ children, ...props }: ComponentPropsType) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-gray-300" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: ComponentPropsType) => (
      <thead className="bg-gray-50" {...props}>{children}</thead>
    ),
    tbody: ({ children, ...props }: ComponentPropsType) => (
      <tbody className="divide-y divide-gray-300" {...props}>{children}</tbody>
    ),
    tr: ({ children, ...props }: ComponentPropsType) => (
      <tr className="hover:bg-gray-50" {...props}>{children}</tr>
    ),
    th: ({ children, ...props }: ComponentPropsType) => (
      <th 
        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-300" 
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: ComponentPropsType) => (
      <td className="px-6 py-4 text-sm border-b border-gray-300" {...props}>{children}</td>
    ),
    
    // Style horizontal rules
    hr: (props: ComponentPropsType) => (
      <hr className="my-8 border-t border-gray-300" {...props} />
    ),
  };

  return (
    <div className="markdown-content prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
} 