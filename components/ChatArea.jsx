import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Send, Sparkles, Menu, X, Settings,
    Maximize2, Minimize2, Share2, Trash2,
    Clock, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/ui_template/ui/button';
import { Textarea } from '@/ui_template/ui/textarea';
import { ScrollArea } from '@/ui_template/ui/scroll-area';
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle,
} from "@/ui_template/ui/dialog";
import MessageBubble from '@/components/MessageBubble';
import { showToast } from '@/ui_template/ui/toast';
const ChatArea = ({ ac }) => {

    const [processingMessageId, setProcessingMessageId] = useState(null);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentChat, setCurrentChat] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [chats, setChats] = useState([]);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [streamingMessage, scrollToBottom]);

    useEffect(() => {
        if (currentChat?.messages.length > 0) {
            scrollToBottom();
        }
    }, [currentChat, scrollToBottom]);

    useEffect(() => {
        const chatHistory = localStorage.getItem('chats');
        if (chatHistory) {
            setChats(JSON.parse(chatHistory));
        }
    }, []);

    const convertImageToBase64 = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, []);

    const processMessageWithLLM = useCallback(async (messages, imageBase64 = null) => {
        try {
            setIsLoading(true);
            const formattedMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.image
                    ? `${msg.content}\n[Attached image: ${msg.image.substring(0, 100)}...]`
                    : msg.content
            }));

            const response = await fetch(process.env.NEXT_PUBLIC_AI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_API_KEY}`
                },
                body: JSON.stringify({
                    model: process.env.NEXT_PUBLIC_AI_MODEL,
                    messages: formattedMessages,
                    stream: true
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = { role: 'assistant', content: '', id: Date.now() };
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.includes('[DONE]')) continue;
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.choices[0]?.delta?.content) {
                                buffer += data.choices[0].delta.content;
                                assistantMessage.content = buffer;
                                setStreamingMessage(buffer);
                            }
                        } catch (error) {
                            console.error('Error parsing stream:', error);
                        }
                    }
                }
            }

            return assistantMessage;
        } catch (error) {
            console.error('Error processing message:', error);
            throw error;
        } finally {
            setIsLoading(false);
            setStreamingMessage('');
        }
    }, []);

    const saveChatsToLocalStorage = useCallback((updatedChats) => {
        localStorage.setItem('chats', JSON.stringify(updatedChats));
        setChats(updatedChats);
    }, []);

    const createNewChat = useCallback(() => {
        const newChat = {
            id: Date.now(),
            messages: [],
            title: 'New Chat',
            lastUpdate: Date.now(),
            category: 'General'
        };
        setCurrentChat(newChat);
        setChats(prev => [newChat, ...prev]);
        setSidebarOpen(false);
    }, []);

    const handleImageUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (file) {

            if (file.size > 5 * 1024 * 1024) {
                showToast({ type: 'error', message: 'File size should be less than 5MB' });
                return;
            }

            try {
                const base64Image = await convertImageToBase64(file);
                setSelectedImage(base64Image);
                if (prompt.trim()) {
                    handleSubmit(null, base64Image);
                }
                showToast({ type: 'Success', message: 'Image uploaded successfully' });
            } catch (error) {
                console.error('Error processing image:', error);
                showToast({ type: 'error', message: 'Failed to process image' });
            }
        }
    }, [convertImageToBase64, prompt]);

    const handleSubmit = useCallback(async (e, imageBase64 = null) => {
        if (e) e.preventDefault();
        if ((!prompt.trim() && !imageBase64 && !selectedImage) || isLoading) {
            showToast({ type: 'warning', message: 'Please enter a message or select an image' });
            return;
        }

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: prompt || '',
            image: imageBase64 || selectedImage,
            timestamp: new Date().toISOString()
        };

        try {
            const updatedMessages = [...(currentChat?.messages || []), userMessage];
            const assistantMessage = await processMessageWithLLM(updatedMessages, userMessage.image);
            const finalMessages = [...updatedMessages, assistantMessage];

            if (!currentChat) {
                const chatTitle = prompt.trim()
                    ? prompt.length > 25 ? prompt.slice(0, 25) + '...' : prompt
                    : 'New Chat';

                const newChat = {
                    id: Date.now(),
                    messages: finalMessages,
                    title: chatTitle,
                    lastUpdate: Date.now(),
                    category: 'General'
                };
                setCurrentChat(newChat);
                saveChatsToLocalStorage([newChat, ...chats]);
            } else {
                const updatedChat = {
                    ...currentChat,
                    messages: finalMessages,
                    title: currentChat.title === 'New Chat' && prompt.trim()
                        ? prompt.length > 25 ? prompt.slice(0, 25) + '...' : prompt
                        : currentChat.title,
                    lastUpdate: Date.now()
                };
                setCurrentChat(updatedChat);
                const updatedChats = chats.map(chat =>
                    chat.id === currentChat.id ? updatedChat : chat
                );
                saveChatsToLocalStorage(updatedChats);
            }
        } catch (error) {
            console.error('Error:', error);
            showToast({ type: 'error', message: 'Failed to send message. Please try again.' });
        } finally {
            setIsLoading(false);
            setPrompt('');
            setSelectedImage(null);
            setStreamingMessage('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [prompt, isLoading, currentChat, chats, selectedImage, processMessageWithLLM, saveChatsToLocalStorage]);

    const loadChat = useCallback((chat) => {
        setCurrentChat(chat);
        setSidebarOpen(false);
        setTimeout(scrollToBottom, 100);
    }, [scrollToBottom]);

    const timeSince = useMemo(() => (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = [
            { seconds: 31536000, label: "years" },
            { seconds: 2592000, label: "months" },
            { seconds: 86400, label: "days" },
            { seconds: 3600, label: "hours" },
            { seconds: 60, label: "minutes" },
            { seconds: 1, label: "seconds" }
        ];

        for (let interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count > 1) {
                return `${count} ${interval.label}`;
            }
        }
        return "just now";
    }, []);

    const deleteChat = useCallback((chatId) => {
        try {
            const updatedChats = chats.filter(chat => chat.id !== chatId);
            saveChatsToLocalStorage(updatedChats);
            if (currentChat?.id === chatId) {
                setCurrentChat(null);
            }
            showToast({ type: 'success', message: 'Chat deleted successfully' });
        } catch (error) {
            showToast({ type: 'error', message: 'Failed to delete chat' });
        }
    }, [chats, currentChat, saveChatsToLocalStorage]);

    const handleMessageEdit = useCallback(async (messageId, newContent) => {
        if (!currentChat) {
            showToast({ type: 'error', message: 'No active chat found' });
            return;
        }
        setProcessingMessageId(messageId);

        try {
            const messageIndex = currentChat.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex === -1) return;

            let updatedMessages = [...currentChat.messages];
            updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                content: newContent
            };

            if (messageIndex + 1 < updatedMessages.length &&
                updatedMessages[messageIndex + 1].role === 'assistant') {
                const messagesUpToEdit = updatedMessages.slice(0, messageIndex + 1);
                const newResponse = await processMessageWithLLM(messagesUpToEdit);
                updatedMessages[messageIndex + 1] = newResponse;
            }

            const updatedChat = {
                ...currentChat,
                messages: updatedMessages,
                lastUpdate: Date.now()
            };

            setCurrentChat(updatedChat);
            const updatedChats = chats.map(chat =>
                chat.id === currentChat.id ? updatedChat : chat
            );
            saveChatsToLocalStorage(updatedChats);
            showToast({ type: 'success', message: 'Message updated successfully' });
        } catch (error) {
            console.error('Error updating message:', error);
            showToast({ type: 'error', message: 'Failed to update message' });
        } finally {
            setProcessingMessageId(null);
        }
    }, [currentChat, chats, processMessageWithLLM, saveChatsToLocalStorage]);

    return (
        <div className={`h-screen w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 transition-all duration-300 ${isExpanded ? 'p-0' : 'p-4'}`}>
            <div className={`h-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex transition-all duration-300 ${isExpanded ? 'scale-100' : 'scale-98 hover:scale-99'}`}>
                {/* Sidebar */}
                <div className={`w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col
                         transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                         lg:translate-x-0 fixed lg:relative h-full z-20`}>

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Chatter AI
                            </h1>
                            <Button onClick={() => setSidebarOpen(false)} className="lg:hidden px-0">
                                <X className="h-5 w-5 text-gray-500" />
                            </Button>
                        </div>

                        <Button
                            onClick={createNewChat}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                                 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none
                                   transition-all duration-300 transform hover:-translate-y-0.5">
                            <Sparkles className="h-4 w-4" />
                            <span>New Chat</span>
                        </Button>
                    </div>

                    {/* Threads List */}
                    <ScrollArea className="flex-1 px-4 py-6">
                        <div className="space-y-2">
                            {chats.map(thread => (
                                <div
                                    key={thread.id}
                                    className="p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                                        transition-all duration-200 group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3
                                            onClick={() => loadChat(thread)}
                                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer flex-1"
                                        >
                                            {thread.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                                            {thread.category}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{timeSince(thread.lastUpdate)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col h-full relative">
                    {/* Top Bar */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                        <Button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <Menu className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-4">
                            {currentChat && (
                                <Button
                                    onClick={() => deleteChat(currentChat.id)}
                                    className="flex items-center gap-2 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all duration-200"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            )}
                            <Button className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <Share2 className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                            </Button>
                            <Link href="/settings" className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <Settings className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {currentChat?.messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    onEdit={handleMessageEdit}
                                    onDelete={(messageId) => {
                                        const updatedMessages = currentChat.messages.filter(msg => msg.id !== messageId);
                                        const updatedChat = { ...currentChat, messages: updatedMessages };
                                        setCurrentChat(updatedChat);
                                        const updatedChats = chats.map(chat =>
                                            chat.id === currentChat.id ? updatedChat : chat
                                        );
                                        saveChatsToLocalStorage(updatedChats);
                                    }}
                                    isProcessing={processingMessageId === message.id}
                                />
                            ))}
                            {streamingMessage && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] p-4 rounded-2xl shadow-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100">
                                        <p className="whitespace-pre-wrap leading-relaxed">{streamingMessage}</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
                        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <ImageIcon className="h-5 w-5" />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    placeholder="Ask anything..."
                                    rows="1"
                                    className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
                                    style={{
                                        minHeight: '56px',
                                        maxHeight: '200px',
                                        overflow: 'auto'
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || (!prompt.trim() && !selectedImage)}
                                    className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500
                   hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg 
                   shadow-lg transition-all duration-200 disabled:opacity-50"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                            {selectedImage && (
                                <div className="mt-2 relative">
                                    <div className="relative w-32 h-32">
                                        <Image
                                            src={selectedImage}
                                            alt="Upload preview"
                                            layout="fill"
                                            objectFit="contain"
                                            className="rounded-lg"
                                        />
                                        <Button
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full"
                                        >
                                            <X className="h-4 w-4 text-white" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
                {/* Image Upload Dialog */}
                <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Image</DialogTitle>
                            <DialogDescription>
                                Choose an image to share in the chat
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default ChatArea