import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit, Copy, Check } from 'lucide-react';

// import ui components
import { Textarea } from '@/ui_template/ui/textarea';
import { Button } from '@/ui_template/ui/button';

const getTextDirection = (text) => {
    const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    const ltrChars = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8]/;

    if (rtlChars.test(text)) {
        return 'rtl';
    } else if (ltrChars.test(text)) {
        return 'ltr';
    }
    return 'ltr';
};
const MessageBubble = ({ message, onEdit, onDelete, isProcessing }) => {
    const [editedContent, setEditedContent] = useState(message.content);
    const [textDirection, setTextDirection] = useState('ltr');
    const [isEditing, setIsEditing] = useState(false);
    const [copyStatus, setCopyStatus] = useState({});

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
            setTimeout(() => {
                setCopyStatus(prev => ({ ...prev, [index]: false }));
            }, 2000);
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
                const textPart = message.content.slice(lastIndex, match.index);
                const textDirection = getTextDirection(textPart);
                parts.push({
                    type: 'text',
                    content: textPart,
                    direction: textDirection
                });
            }

            parts.push({
                type: 'code',
                content: match[0].slice(3, -3),
                direction: 'ltr' // Code blocks are always LTR
            });

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < message.content.length) {
            const remainingText = message.content.slice(lastIndex);
            const textDirection = getTextDirection(remainingText);
            parts.push({
                type: 'text',
                content: remainingText,
                direction: textDirection
            });
        }

        return parts.length > 0 ? (
            parts.map((part, index) => {
                if (part.type === 'code') {
                    return (
                        <div key={index} className="relative group my-2 w-full">
                            <div className="max-w-full overflow-x-auto">
                                <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg 
                                              text-sm whitespace-pre-wrap break-words
                                              overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 
                                              scrollbar-track-gray-200 leading-7"
                                    dir="ltr">
                                    <code>{part.content}</code>
                                </pre>
                            </div>
                            <button
                                onClick={() => handleCopy(part.content, index)}
                                className="absolute top-2 right-2 p-2 bg-gray-300 dark:bg-gray-600 
                                         rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                                         md:block hidden"
                            >
                                {copyStatus[index] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                            {/* Mobile copy button */}
                            <button
                                onClick={() => handleCopy(part.content, index)}
                                className="absolute top-2 right-2 p-2 bg-gray-300 dark:bg-gray-600 
                                         rounded-md md:hidden block"
                            >
                                {copyStatus[index] ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    );
                }
                return (
                    <p key={index}
                        className="text-sm leading-8 whitespace-pre-wrap"
                        style={{
                            textAlign: part.direction === 'rtl' ? 'right' : 'left',
                            direction: part.direction
                        }}>
                        {part.content}
                    </p>
                );
            })
        ) : (
            <p className="text-sm leading-8 whitespace-pre-wrap"
                style={{
                    textAlign: textDirection === 'rtl' ? 'right' : 'left',
                    direction: textDirection
                }}>
                {message.content}
            </p>
        );
    };

    return (
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group w-full`}>
            <div className={`relative max-w-[85%] md:max-w-[80%] ${message.role === 'user'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                } p-4 rounded-2xl shadow-sm`}>

                {message.role === 'user' && !isEditing && (
                    <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-1">
                            <Edit className="h-4 w-4 text-gray-700 dark:text-white" onClick={() => setIsEditing(true)} />
                        </Button>
                    </div>
                )}

                <div className="space-y-4">
                    {message.image && (
                        <div className="w-full max-w-[600px]">
                            <div className="relative w-full" style={{ height: '300px' }}>
                                <Image
                                    src={message.image}
                                    alt="Uploaded content"
                                    layout="fill"
                                    objectFit="contain"
                                    className="rounded-lg position-important"
                                    priority
                                />
                            </div>
                        </div>
                    )}

                    {isEditing ? (
                        <div className="space-y-2 transition-all duration-300">
                            <Textarea
                                value={editedContent}
                                onChange={(e) => {
                                    setEditedContent(e.target.value);
                                    setTextDirection(getTextDirection(e.target.value));
                                }}
                                className="min-h-[100px] w-full p-3 rounded-xl text-gray-700 dark:text-white
                                     border-2 border-indigo-200 focus:border-indigo-400
                                     dark:bg-gray-800 dark:border-gray-700
                                     transition-all duration-200
                                     shadow-inner resize-none
                                     focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800"
                                style={{
                                    textAlign: textDirection === 'rtl' ? 'right' : 'left',
                                    direction: textDirection
                                }}
                                placeholder="Edit your message..."
                            />
                            <div className="flex justify-end gap-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setEditedContent(message.content);
                                        setIsEditing(false);
                                    }}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800
                                    transition-all duration-200 rounded-xl px-4"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isProcessing}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500
                                    hover:from-indigo-600 hover:to-purple-600
                                    text-white rounded-xl px-4 transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full overflow-hidden">
                            {renderContent()}
                        </div>
                    )}
                </div>

                {isProcessing && (
                    <div className="absolute bottom-2 right-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;