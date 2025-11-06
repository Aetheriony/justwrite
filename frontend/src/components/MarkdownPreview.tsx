// src/components/MarkdownPreview.tsx

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Optional: for GitHub Flavored Markdown (tables, task lists)

export function MarkdownPreview({ content }: { content: string }) {
  if (!content) return null; // Don't show if content is empty

  return (
    <div className="mt-4 p-6 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-100 shadow-md">
      <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white border-b pb-2">AI-Generated Content Preview:</h2>
      <div className="prose dark:prose-invert max-w-none">
        {/* The 'prose' class here (from Tailwind CSS Typography plugin)
                  is CRUCIAL for making Markdown look good (spacing for headings, lists, etc.)
                */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
