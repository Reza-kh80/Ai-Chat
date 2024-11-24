import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // This handles HTML

const CodeBlock = ({ code, language }) => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            Prism.highlightAll();
        }
    }, [code]);

    // Map 'html' to 'markup' as that's how Prism refers to HTML
    const prismLanguage = language === 'html' ? 'markup' : language;

    return (
        <div className="relative group my-4">
            <pre className="rounded-lg overflow-x-auto p-4 bg-[#1E1E1E] text-white">
                <code className={`language-${prismLanguage}`}>
                    {code}
                </code>
            </pre>
            <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 
                         text-white rounded px-2 py-1 text-xs opacity-0 
                         group-hover:opacity-100 transition-opacity"
            >
                Copy
            </button>
        </div>
    );
};

export default CodeBlock;