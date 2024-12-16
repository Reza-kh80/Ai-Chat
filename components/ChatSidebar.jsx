import React from 'react';
import { Sparkles, X, Clock, MessageSquare } from 'lucide-react';
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
            className={`w-[300px] bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col
                       transition-all duration-300 ease-in-out
                       ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                       lg:translate-x-0 fixed lg:relative h-full z-20`}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        FitTech AI
                    </h1>
                    <Button
                        onClick={() => onSetSidebarOpen(false)}
                        className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2"
                    >
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                </div>

                <Button
                    onClick={onCreateNewChat}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                             text-white rounded-xl flex items-center justify-center gap-3
                             transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">New Chat</span>
                </Button>
            </div>

            {/* Threads List */}
            <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-2.5">
                    {chats.map(
                        (thread) =>
                            !thread.isTemp && (
                                <div
                                    key={thread.id}
                                    onClick={() => onLoadChat(thread)}
                                    style={{ boxShadow: '-2px 0px 5px rgba(99, 102, 241, 0.1)' }}
                                    className={`p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                                              transition-all duration-200 group cursor-pointer
                                              ${currentChat?.id === thread.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20'
                                            : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2.5">
                                        <div className={`p-2 rounded-lg 
                                            ${currentChat?.id === thread.id
                                                ? 'bg-indigo-100 dark:bg-indigo-800/50'
                                                : 'bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                            <MessageSquare className={`h-4 w-4 
                                                ${currentChat?.id === thread.id
                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                    : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            />
                                        </div>
                                        <h3
                                            className={`font-medium flex-1 truncate
                                                ${currentChat?.id === thread.id
                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                    : 'text-gray-900 dark:text-gray-100'
                                                }`}
                                        >
                                            {thread.title || 'Untitled Chat'}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium
                                                ${currentChat?.id === thread.id
                                                    ? 'bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            {thread.category}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-xs">{timeSince(thread.lastUpdate)}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                    )}
                    {tempChat && (
                        <div
                            style={{ boxShadow: '-2px 0px 5px rgba(99, 102, 241, 0.1)' }}
                            className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/30
                                     transition-all duration-200 group opacity-60"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800">
                                    <MessageSquare className="h-4 w-4 text-gray-500" />
                                </div>
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