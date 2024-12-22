import React from 'react';
import { Sparkles, X, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/ui_template/ui/button';
import { ScrollArea } from '@/ui_template/ui/scroll-area';
import { motion } from 'framer-motion';

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
            className={`w-[300px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col
                   transition-all duration-300 ease-in-out
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                   lg:translate-x-0 fixed lg:relative h-full z-20`}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/95 backdrop-blur-lg sticky top-0 z-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        FitTech AI
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSetSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCreateNewChat}
                    className="w-full py-3.5 px-4 bg-indigo-600/90 hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-600
                         text-white dark:text-white rounded-xl flex items-center justify-center gap-3
                         transition-all duration-200 shadow-sm hover:shadow-md
                         border border-indigo-400/20 dark:border-indigo-400/20
                         relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/50 to-indigo-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <Sparkles className="h-4 w-4 relative z-10" />
                    <span className="font-semibold relative z-10">New Chat</span>
                </motion.button>
            </div>

            {/* Threads List */}
            <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-2">
                    {chats.map(
                        (thread) =>
                            !thread.isTemp && (
                                <motion.div
                                    key={thread.id}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => onLoadChat(thread)}
                                    className={`relative pl-4 pr-3 py-3 rounded-lg cursor-pointer
                                              transition-all duration-200 group
                                              ${currentChat?.id === thread.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    {/* Colored left border */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full
                                        ${currentChat?.id === thread.id
                                            ? 'bg-indigo-600 dark:bg-indigo-500'
                                            : 'bg-transparent group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                                        }`}
                                    />

                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg
                                            ${currentChat?.id === thread.id
                                                ? 'bg-indigo-100 dark:bg-indigo-900/50'
                                                : 'bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                            <MessageSquare className={`h-4 w-4 
                                                ${currentChat?.id === thread.id
                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                    : 'text-gray-500 dark:text-gray-400'
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
                                    <div className="flex items-center gap-3 text-sm pl-11">
                                        <span
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium
                                                ${currentChat?.id === thread.id
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            {thread.category}
                                        </span>
                                        <div className="flex items-center gap-1.5 ml-auto text-gray-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-xs">{timeSince(thread.lastUpdate)} ago</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                    )}
                    {tempChat && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.6, y: 0 }}
                            className="pl-4 pr-3 py-3 rounded-lg
                                     bg-gray-50 dark:bg-gray-800/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                    <MessageSquare className="h-4 w-4 text-gray-500" />
                                </div>
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                    New Chat
                                </h3>
                            </div>
                        </motion.div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ChatSidebar;