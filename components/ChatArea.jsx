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
import axiosInstance from '@/lib/axiosInstance';
const ChatArea = () => {

    const [processingMessageId, setProcessingMessageId] = useState(null);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentChat, setCurrentChat] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tempChat, setTempChat] = useState(null);
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
        const loadChats = async () => {
            try {
                const response = await axiosInstance.get('/chats');
                if (response.data) {
                    setChats(response.data.chats);
                }
            } catch (error) {
                console.error('Error loading chats:', error);
            }
        };
        loadChats();
    }, []);

    const convertImageToBase64 = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, []);

    const handleImageUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast({ type: 'error', message: 'File size should be less than 5MB' });
                return;
            }

            try {
                const formData = new FormData();
                formData.append('image', file);

                const response = await axiosInstance.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const base64Image = response.data.imageUrl;
                setSelectedImage(base64Image);
                if (prompt.trim()) {
                    handleSubmit(null, base64Image);
                }
                showToast({ type: 'success', message: 'Image uploaded successfully' });
            } catch (error) {
                console.error('Error processing image:', error);
                showToast({ type: 'error', message: 'Failed to process image' });
            }
        }
    }, [prompt]);

    const timeSince = useMemo(() => (dateString) => {
        const date = new Date(dateString.replace(' ', 'T'));

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
            if (count >= 1) {
                return count === 1
                    ? `${count} ${interval.label.slice(0, -1)}`
                    : `${count} ${interval.label}`;
            }
        }
        return "just now";
    }, []);

    const createNewChat = useCallback(() => {
        const tempNewChat = {
            id: 'temp-' + Date.now(), // Temporary ID
            title: '',
            category: 'General',
            messages: [],
            isTemp: true // Flag to identify temporary chats
        };
        setTempChat(tempNewChat);
        setCurrentChat(tempNewChat);
        setSidebarOpen(false);
    }, []);

    const loadChat = useCallback((chat) => {
        setCurrentChat(chat);
        setSidebarOpen(false);
        setTimeout(scrollToBottom, 100);
    }, [scrollToBottom]);

    const deleteChat = async (chatId) => {
        try {
            const response = await axiosInstance.delete(`/chats/${chatId}`);
            setChats((prev) => prev.filter((chat) => chat.id !== chatId));
            if (currentChat?.id === chatId) {
                setCurrentChat(null);
            }
            showToast({ type: 'success', message: response.data.message });
        } catch (error) {
            console.error('Error deleting chat:', error);
            showToast({ type: 'error', message: 'Failed to delete chat' });
        }
    };

    const handleSubmit = useCallback(async (e, imageBase64 = null) => {
        if (e) e.preventDefault();
        if ((!prompt.trim() && !imageBase64 && !selectedImage) || isLoading) {
            showToast({ type: 'warning', message: 'Please enter a message or select an image' });
            return;
        }

        setIsLoading(true);

        const userMessage = {
            id: Date.now(),
            content: prompt || '',
            role: 'user',
            image: imageBase64 || selectedImage,
        };

        try {
            let chatId;
            let currentChatToUse = currentChat;

            // اگر این یک چت موقت است یا چتی وجود ندارد، ابتدا یک چت جدید ایجاد می‌کنیم
            if (!currentChat || currentChat?.isTemp) {
                const chatTitle = prompt.trim().substring(0, 30) + (prompt.length > 30 ? '...' : '');
                const response = await axiosInstance.post('/chats', {
                    title: chatTitle,
                    category: 'General'
                });

                currentChatToUse = response.data.chat;
                chatId = response.data.chat.id;

                // آپدیت state ها
                setCurrentChat(currentChatToUse);
                setChats(prev => [currentChatToUse, ...prev.filter(c => !c.isTemp)]);
                setTempChat(null);
            } else {
                chatId = currentChat.id;
            }

            // نمایش پیام کاربر به صورت فوری
            setCurrentChat(prev => ({
                ...prev,
                messages: [...(prev?.messages || []), userMessage]
            }));

            // ارسال پیام به سرور
            const response = await axiosInstance.post('/messages', {
                chatId: chatId,
                content: prompt || '',
                image: imageBase64 || selectedImage
            }, {
                responseType: 'text',
            });

            const lines = response.data.split('\n').filter(line => line.trim() !== '');
            let assistantMessage = '';

            for (const line of lines) {
                if (line.includes('[DONE]')) continue;
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        switch (data.type) {
                            case 'init':
                                const chatWithoutMessages = { ...data.chat };
                                delete chatWithoutMessages.messages;
                                setCurrentChat(prev => ({
                                    ...prev,
                                    ...chatWithoutMessages
                                }));
                                break;

                            case 'chunk':
                                assistantMessage += data.content;
                                setStreamingMessage(assistantMessage);
                                await new Promise(resolve => setTimeout(resolve, 30));
                                break;

                            case 'done':
                                setStreamingMessage('');
                                const finalMessage = {
                                    id: Date.now(),
                                    content: data.content,
                                    role: 'assistant',
                                };

                                // آپدیت چت فعلی
                                setCurrentChat(prev => ({
                                    ...prev,
                                    messages: [...prev.messages, finalMessage]
                                }));

                                // آپدیت لیست چت‌ها
                                setChats(prev =>
                                    prev.map(chat =>
                                        chat.id === chatId
                                            ? {
                                                ...chat,
                                                messages: [...(chat.messages || []), finalMessage]
                                            }
                                            : chat
                                    )
                                );
                                break;

                            case 'error':
                                throw new Error(data.error);
                        }
                    } catch (error) {
                        console.error('Error parsing stream:', error);
                        showToast({ type: 'error', message: 'Error parsing response' });
                    }
                }
            }

        } catch (error) {
            console.error('Error:', error);
            showToast({ type: 'error', message: 'Failed to send message. Please try again.' });
        } finally {
            setIsLoading(false);
            setPrompt('');
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [prompt, isLoading, currentChat, selectedImage, showToast]);

    const handleMessageEdit = useCallback(async (messageId, newContent) => {
        if (!currentChat) {
            showToast({ type: 'error', message: 'No active chat found' });
            return;
        }

        setProcessingMessageId(messageId);

        try {
            const editedMessageIndex = currentChat.messages.findIndex(msg => msg.id === messageId);

            const updatedMessages = [...currentChat.messages];
            updatedMessages[editedMessageIndex] = {
                ...updatedMessages[editedMessageIndex],
                content: newContent
            };

            const updatedChat = { ...currentChat, messages: updatedMessages };
            setCurrentChat(updatedChat);

            // API call to edit the message and get AI response
            const response = await axiosInstance.put('/messages',
                { messageId, newContent },
                { responseType: 'text' }
            );

            const lines = response.data.split('\n').filter(line => line.trim() !== '');
            let assistantMessage = '';

            for (const line of lines) {
                if (line.includes('[DONE]')) continue;
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        switch (data.type) {
                            case 'chunk':
                                assistantMessage += data.content;
                                setStreamingMessage(assistantMessage);
                                // Add a small delay to make the streaming appear more natural
                                await new Promise(resolve => setTimeout(resolve, 30));
                                break;

                            case 'done':
                                setStreamingMessage('');

                                const nextAssistantMessageIndex = currentChat.messages.findIndex(
                                    (msg, index) =>
                                        msg.role === 'assistant' &&
                                        editedMessageIndex < index
                                );

                                const finalMessages = nextAssistantMessageIndex !== -1
                                    ? [
                                        ...updatedMessages.slice(0, nextAssistantMessageIndex),
                                        {
                                            id: updatedMessages[nextAssistantMessageIndex].id,
                                            content: data.content,
                                            role: 'assistant',
                                        },
                                        ...updatedMessages.slice(nextAssistantMessageIndex + 1)
                                    ]
                                    : updatedMessages;

                                setCurrentChat(prev => ({
                                    ...prev,
                                    messages: finalMessages
                                }));

                                setChats(prev =>
                                    prev.map(chat =>
                                        chat.id === currentChat.id
                                            ? {
                                                ...chat,
                                                messages: finalMessages
                                            }
                                            : chat
                                    )
                                );

                                showToast({ type: 'success', message: 'Message updated successfully' });
                                break;

                            case 'error':
                                throw new Error(data.error);
                        }
                    } catch (error) {
                        console.error('Error parsing stream:', error);
                        showToast({ type: 'error', message: 'Error processing response' });
                    }
                }
            }
        } catch (error) {
            console.error('Error updating message:', error);
            showToast({ type: 'error', message: 'Failed to update message' });

            setCurrentChat(currentChat);
        } finally {
            setProcessingMessageId(null);
        }
    }, [currentChat, chats, setStreamingMessage, showToast]);

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
                            {chats.map(thread => !thread.isTemp && (
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
                                            {thread.title || 'Untitled Chat'}
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
                            {tempChat && (
                                <div className="p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                        transition-all duration-200 group opacity-50">
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
                                <div key="streaming-message" className="flex justify-start">
                                    <div className="max-w-[80%] p-4 rounded-2xl shadow-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100">
                                        <p className="whitespace-pre-wrap leading-relaxed animate-typing">
                                            {streamingMessage}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
                        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
                            <div className="relative">
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 z-10">
                                    <Button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                    </Button>
                                    {selectedImage && (
                                        <Button
                                            onClick={() => setSelectedImage(null)}
                                            className="p-1 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
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
                                    className="pl-12 pr-16 py-4 flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 outline-none 
                    text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none w-full"
                                    style={{
                                        minHeight: '56px',
                                        maxHeight: '200px',
                                        overflow: 'auto'
                                    }}
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
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
                                    </div>
                                </div>
                            )}
                            {/* <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            /> */}
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