import React from 'react';
import { Sparkles, X, Clock } from 'lucide-react';
import { Button } from '@/ui_template/ui/button';
import { ScrollArea } from '@/ui_template/ui/scroll-area';

const ChatSidebar = ({
    chats,
    currentChat,
    onCreateNewChat,
    onLoadChat,
    isSidebarOpen,
    onSetSidebarOpen,
    timeSince,
    tempChat
}) => {
    return (
        <div
            className={`w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col
                         transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                         lg:translate-x-0 fixed lg:relative h-full z-20`}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        FitTech AI
                    </h1>
                    <Button onClick={() => onSetSidebarOpen(false)} className="lg:hidden px-0">
                        <X className="h-5 w-5 text-gray-500" />
                    </Button>
                </div>

                <Button
                    onClick={onCreateNewChat}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                                 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none
                                   transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <Sparkles className="h-4 w-4" />
                    <span>New Chat</span>
                </Button>
            </div>

            {/* Threads List */}
            <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-2">
                    {chats.map(
                        (thread) =>
                            !thread.isTemp && (
                                <div
                                    key={thread.id}
                                    onClick={() => onLoadChat(thread)}
                                    className={`p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
            transition-all duration-200 group cursor-pointer
            ${currentChat?.id === thread.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20'
                                            : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3
                                            className={`font-mikhak cursor-pointer flex-1
                ${currentChat?.id === thread.id
                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                    : 'text-gray-900 dark:text-gray-100'
                                                }`}
                                        >
                                            {thread.title || 'Untitled Chat'}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span
                                            className={`px-2 py-1 rounded-md 
                ${currentChat?.id === thread.id
                                                    ? 'bg-indigo-100 dark:bg-indigo-800/50'
                                                    : 'bg-gray-100 dark:bg-gray-800'
                                                }`}
                                        >
                                            {thread.category}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{timeSince(thread.lastUpdate)}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                    )}
                    {tempChat && (
                        <div
                            className="p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                        transition-all duration-200 group opacity-50"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                    New Chat
                                </h3>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ChatSidebar;