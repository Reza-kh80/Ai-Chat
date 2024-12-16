import React, { useState } from 'react';
import {
    Menu,
    Share2,
    Trash2,
    Maximize2,
    Minimize2,
    Settings,
    Link2,
    Mail,
    Twitter,
    Send,
    X
} from 'lucide-react';
import { Button } from '@/ui_template/ui/button';
import Link from 'next/link';

const ChatTopBar = ({ currentChat, isExpanded, onDeleteChat, onSetIsExpanded, onSetSidebarOpen }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const copyToClipboard = async () => {
        const currentUrl = window.location.href;

        try {
            // Try using the Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(currentUrl);
                setCopySuccess(true);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = currentUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    textArea.remove();
                    setCopySuccess(true);
                } catch (err) {
                    console.error('Failed to copy URL: ', err);
                    textArea.remove();
                }
            }
        } catch (err) {
            console.error('Failed to copy URL: ', err);
        }

        // Reset success message after 2 seconds
        setTimeout(() => {
            setCopySuccess(false);
            setShowShareModal(false);
        }, 2000);
    };

    const shareToPlatform = (platform) => {
        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);

        const shareUrls = {
            telegram: `https://t.me/share/url?url=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
            email: `mailto:?body=${encodedUrl}`
        };

        window.open(shareUrls[platform], '_blank');
        setShowShareModal(false);
    };

    return (
        <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <Button
                    onClick={() => onSetSidebarOpen(true)}
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-4">
                    {currentChat && (
                        <Button
                            onClick={() => onDeleteChat(currentChat.id)}
                            className="flex items-center gap-2 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all duration-200"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}
                    <Button
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        onClick={() => setShowShareModal(true)}
                    >
                        <Share2 className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={() => onSetIsExpanded(!isExpanded)}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                        {isExpanded ? (
                            <Minimize2 className="h-5 w-5" />
                        ) : (
                            <Maximize2 className="h-5 w-5" />
                        )}
                    </Button>
                    <Link
                        href="/settings"
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                        <Settings className="h-5 w-5" />
                    </Link>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Share Chat
                            </h3>
                            <Button
                                onClick={() => setShowShareModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="grid gap-4">
                                {/* Copy Link Button */}
                                <button
                                    onClick={copyToClipboard}
                                    className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${copySuccess ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                                            <Link2 className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium">
                                            {copySuccess ? 'Copied!' : 'Copy Link'}
                                        </span>
                                    </div>
                                </button>

                                {/* Share Options */}
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => shareToPlatform('telegram')}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <div className="p-2 bg-[#229ED9]/10 rounded-lg">
                                            <Send className="h-5 w-5 text-[#229ED9]" />
                                        </div>
                                        <span className="text-sm">Telegram</span>
                                    </button>

                                    <button
                                        onClick={() => shareToPlatform('twitter')}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <div className="p-2 bg-[#1DA1F2]/10 rounded-lg">
                                            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                                        </div>
                                        <span className="text-sm">Twitter</span>
                                    </button>

                                    <button
                                        onClick={() => shareToPlatform('email')}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm">Email</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatTopBar;