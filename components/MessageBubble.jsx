import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit, Copy, Check, Trash2, Save, X } from 'lucide-react';
import { Textarea } from '@/ui_template/ui/textarea';
import { Button } from '@/ui_template/ui/button';
import ReactMarkdown from 'react-markdown';
import ImageGallery from './ImageGallery';

const getTextDirection = (text) => {
    const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    const ltrChars = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8]/;
    return rtlChars.test(text) ? 'rtl' : ltrChars.test(text) ? 'ltr' : 'ltr';
};
const MessageBubble = ({ message, onEdit, onDelete, isProcessing }) => {

    const [editedContent, setEditedContent] = useState(message.content);
    const [textDirection, setTextDirection] = useState('ltr');
    const [isEditing, setIsEditing] = useState(false);
    const [copyStatus, setCopyStatus] = useState({});

    const isUser = message.role === 'user';

    useEffect(() => {
        setTextDirection(getTextDirection(message.content));
    }, [message.content]);

    const handleSave = async () => {
        if (editedContent !== message.content) {
            await onEdit(message.id, editedContent);
        }
        setIsEditing(false);
    };

    const handleCopy = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyStatus(prev => ({ ...prev, [index]: true }));
            setTimeout(() => setCopyStatus(prev => ({ ...prev, [index]: false })), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const renderContent = () => {
        const codeBlockRegex = /```[\s\S]*?```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(message.content)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: message.content.slice(lastIndex, match.index),
                    direction: getTextDirection(message.content.slice(lastIndex, match.index))
                });
            }
            parts.push({
                type: 'code',
                content: match[0].slice(3, -3),
                direction: 'ltr'
            });
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < message.content.length) {
            parts.push({
                type: 'text',
                content: message.content.slice(lastIndex),
                direction: getTextDirection(message.content.slice(lastIndex))
            });
        }

        return parts.map((part, index) => (
            part.type === 'code' ? (
                <div key={index} className="relative my-2 rounded-lg overflow-hidden border 
                                         border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between px-4 py-2 
                                  bg-gray-100/50 dark:bg-gray-800/50 border-b 
                                  border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Code</span>
                        <button
                            onClick={() => handleCopy(part.content, index)}
                            className="p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 
                                     transition-colors duration-200"
                        >
                            {copyStatus[index] ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto bg-gray-50/50 dark:bg-gray-900/50">
                        <code>{part.content}</code>
                    </pre>
                </div>
            ) : (
                <div key={index}
                    className="text-sm leading-7 my-2 break-words markdown-content"
                    style={{
                        textAlign: part.direction === 'rtl' ? 'right' : 'left',
                        direction: part.direction
                    }}>
                    <ReactMarkdown
                        components={{
                            p: ({ node, ...props }) => (
                                <p className="mb-4 whitespace-pre-wrap" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                                <ul className="list-disc list-inside mb-4" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                                <ol className="list-decimal list-inside mb-4" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                                <li className="mb-2" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                                <strong className="font-bold" {...props} />
                            ),
                            em: ({ node, ...props }) => (
                                <em className="italic" {...props} />
                            ),
                        }}
                    >
                        {part.content}
                    </ReactMarkdown>
                </div>
            )
        ));
    };

    return (
        <div className="w-full max-w-4xl mx-auto my-4">
            <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 rounded-full shrink-0 overflow-hidden
                ${isUser
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-white'
                    }`}>
                    {isUser ? (
                        <Image
                            src="/Images/U-Icon.jpeg"
                            alt="Assistant Avatar"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            priority
                        />
                    ) : (
                        <Image
                            src="/Images/A-Icon.jpeg"
                            alt="Assistant Avatar"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            priority
                        />
                    )}
                </div>

                <div className="group relative flex-1 max-w-[80%]">
                    <div className={`absolute top-4 w-4 h-4 rotate-45
                                   ${isUser
                            ? '-left-2 bg-blue-50 dark:bg-indigo-950 border-l border-t border-blue-200/50 dark:border-indigo-800/50'
                            : '-right-2 bg-gray-50 dark:bg-gray-900 border-r border-t border-gray-200/50 dark:border-gray-700/50'
                        }`} />

                    <div className={`rounded-lg shadow-sm p-4
                                   ${isUser
                            ? 'bg-blue-50 dark:bg-indigo-950 border border-blue-200/50 dark:border-indigo-800/50'
                            : 'bg-gray-50 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50'
                        }`}>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Textarea
                                        value={editedContent}
                                        onChange={(e) => {
                                            setEditedContent(e.target.value);
                                            setTextDirection(getTextDirection(e.target.value));
                                        }}
                                        className={`min-h-[120px] w-full resize-none rounded-lg p-4
                                                  bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                                                  border-2 transition-all duration-200
                                                  ${isUser
                                                ? 'border-blue-200 dark:border-indigo-800 focus:border-blue-400 dark:focus:border-indigo-600'
                                                : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-600'
                                            }
                                                  focus:ring-2 
                                                  ${isUser
                                                ? 'focus:ring-blue-300/50 dark:focus:ring-indigo-700/50'
                                                : 'focus:ring-gray-300/50 dark:focus:ring-gray-700/50'
                                            }`}
                                        style={{
                                            textAlign: textDirection === 'rtl' ? 'right' : 'left',
                                            direction: textDirection
                                        }}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        onClick={() => {
                                            setEditedContent(message.content);
                                            setIsEditing(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg
                                                 text-gray-700 dark:text-gray-200 bg-gray-100 
                                                 dark:bg-gray-800 hover:bg-gray-200 
                                                 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isProcessing}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg
                                                 text-white bg-gradient-to-r from-blue-500 to-indigo-600
                                                 hover:from-blue-600 hover:to-indigo-700
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 transition-all duration-200"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isProcessing ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                {renderContent()}
                                {message.images && message.images.length > 0 && (
                                    <ImageGallery images={message.images} />
                                )}
                                {isUser && (
                                    <div className="absolute -right-14 top-0 opacity-0 group-hover:opacity-100 
                                                  transition-opacity duration-200 flex flex-col gap-2">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 
                                                     dark:bg-blue-900/30 dark:hover:bg-blue-800/50 
                                                     transition-colors duration-200"
                                        >
                                            <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(message.id)}
                                            className="p-2 rounded-full bg-red-100 hover:bg-red-200 
                                                     dark:bg-red-900/30 dark:hover:bg-red-800/50 
                                                     transition-colors duration-200"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {isProcessing && (
                            <div className="absolute bottom-2 right-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 
                                              border-blue-500 border-t-transparent"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;