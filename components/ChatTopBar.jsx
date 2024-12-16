import React from 'react';
import { Menu, Share2, Trash2, Maximize2, Minimize2, Settings } from 'lucide-react';
import { Button } from '@/ui_template/ui/button';
import Link from 'next/link';

const ChatTopBar = ({ currentChat, isExpanded, onDeleteChat, onSetIsExpanded, onSetSidebarOpen }) => {
    return (
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
                <Button className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
    );
};

export default ChatTopBar;