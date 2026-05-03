import ReactMarkdown from "react-markdown";

export default function Markdown({ content }: { content: string | null }) {
  if (!content) return null;

  return (
    <div className="markdown text-stone-800 leading-relaxed">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-4">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 underline hover:text-emerald-900 break-all"
            >
              {children}
            </a>
          ),
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              <img
                src={src}
                alt={alt ?? ""}
                className="my-4 max-w-full h-auto rounded-lg border border-stone-200"
              />
            ) : null,
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-stone-300 pl-4 italic text-stone-600 my-4">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="px-1 py-0.5 bg-stone-100 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="p-3 bg-stone-100 rounded my-4 overflow-x-auto text-sm">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-6 border-stone-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
