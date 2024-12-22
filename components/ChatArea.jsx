import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { showToast } from '@/ui_template/ui/toast';
import axiosInstance from '@/lib/axiosInstance';
import ChatSidebar from './ChatSidebar';
import ChatTopBar from './ChatTopBar';
import ChatMessageList from './ChatMessageList';
import ChatInputArea from './ChatInputArea';

// --- Helper Functions ---
const getTextDirection = (text) => {
    const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    const ltrChars = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8]/;
    if (rtlChars.test(text)) return 'rtl';
    if (ltrChars.test(text)) return 'ltr';
    return 'ltr';
};

const timeSince = (dateString) => {
    const date = new Date(dateString.replace(' ', 'T'));
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
        { seconds: 31536000, label: 'years' },
        { seconds: 2592000, label: 'months' },
        { seconds: 86400, label: 'days' },
        { seconds: 3600, label: 'hours' },
        { seconds: 60, label: 'minutes' },
        { seconds: 1, label: 'seconds' },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return count === 1
                ? `${count} ${interval.label.slice(0, -1)}`
                : `${count} ${interval.label}`;
        }
    }
    return 'just now';
};

const ChatArea = ({ initialChat }) => {
    const router = useRouter();
    const params = useParams();

    // --- State Variables ---
    const [processingMessageId, setProcessingMessageId] = useState(null);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [textDirection, setTextDirection] = useState('ltr');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentChat, setCurrentChat] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [tempChat, setTempChat] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [chats, setChats] = useState([]);

    // --- Refs ---
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // --- Scroll to Bottom Functionality ---
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // --- Effects ---
    useEffect(() => {
        setTextDirection(getTextDirection(prompt));
    }, [prompt]);

    useEffect(() => {
        scrollToBottom();
    }, [streamingMessage, scrollToBottom]);

    useEffect(() => {
        if (initialChat) {
            setCurrentChat(initialChat);
        }
    }, [initialChat]);

    useEffect(() => {
        if (currentChat?.messages?.length > 0) {
            scrollToBottom();
        }
    }, [currentChat, scrollToBottom]);

    useEffect(() => {
        const loadChats = async () => {
            try {
                const response = await axiosInstance.get('/chats');
                if (response.data?.chats) {
                    const loadedChats = response.data.chats;
                    setChats(loadedChats);

                    // If we have an initialChat, make sure it's in sync with the loaded chats
                    if (initialChat) {
                        const updatedInitialChat = loadedChats.find(
                            chat => chat.id === initialChat.id
                        );
                        if (updatedInitialChat) {
                            setCurrentChat(updatedInitialChat);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading chats:', error);
                showToast({ type: 'error', message: 'Failed to load chats.' });
            }
        };
        loadChats();
    }, [initialChat]);

    // --- Message Submission Handler ---
    const handleSubmit = useCallback(
        async (e, imageBase64 = null) => {
            if (e) e.preventDefault();
            if ((!prompt.trim() && !imageBase64 && !selectedImage) || isLoading) {
                showToast({
                    type: 'warning',
                    message: 'Please enter a message or select an image',
                });
                return;
            }

            setIsLoading(true);

            try {
                setPrompt('');
                let chatId;
                let currentChatToUse = currentChat;

                // Inside handleSubmit function, in the "Create a new chat" section:
                if (!currentChat || currentChat?.isTemp) {
                    const chatTitle =
                        prompt.trim().substring(0, 30) +
                        (prompt.length > 30 ? '...' : '');
                    const response = await axiosInstance.post('/chats', {
                        title: chatTitle,
                        category: 'General',
                    });

                    currentChatToUse = response.data.chat;
                    chatId = response.data.chat.id;

                    // Update states
                    setCurrentChat(currentChatToUse);
                    setChats((prev) => [
                        currentChatToUse,
                        ...prev.filter((c) => !c.isTemp),
                    ]);
                    setTempChat(null);

                    // Update URL without triggering a full navigation
                    window.history.pushState({}, '', `/chat/${chatId}`);
                } else {
                    chatId = currentChat.id;
                }

                // Get the latest message ID
                let lastMessageId = 0;
                if (currentChatToUse?.messages?.length > 0) {
                    lastMessageId =
                        currentChatToUse.messages[currentChatToUse.messages.length - 1].id;
                } else if (chats.length > 0 && chats[0]?.messages?.length > 0) {
                    lastMessageId = chats[0].messages[chats[0].messages.length - 1].id;
                }

                const userMessage = {
                    id: lastMessageId + 1,
                    content: prompt || '',
                    role: 'user',
                    image: imageBase64 || selectedImage,
                };

                // Display user message immediately
                setCurrentChat((prev) => ({
                    ...prev,
                    messages: [...(prev?.messages || []), userMessage],
                }));

                // Send message to server
                const response = await axiosInstance.post(
                    '/messages',
                    {
                        chatId: chatId,
                        content: prompt || '',
                        image: imageBase64 || selectedImage,
                    },
                    {
                        responseType: 'text',
                    }
                );

                const lines = response.data.split('\n').filter((line) => line.trim() !== '');
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
                                    setCurrentChat((prev) => ({
                                        ...prev,
                                        ...chatWithoutMessages,
                                    }));
                                    break;

                                case 'chunk':
                                    assistantMessage += data.content;
                                    setStreamingMessage(assistantMessage);
                                    await new Promise((resolve) => setTimeout(resolve, 30));
                                    break;

                                case 'done':
                                    setStreamingMessage('');
                                    const finalMessage = {
                                        id: lastMessageId + 2,
                                        content: data.content,
                                        role: 'assistant',
                                        images: data.url ? data.url : [],
                                    };

                                    // Update current chat
                                    setCurrentChat((prev) => ({
                                        ...prev,
                                        messages: [...(prev?.messages || []), finalMessage],
                                    }));

                                    // Update chats list
                                    setChats((prev) =>
                                        prev.map((chat) =>
                                            chat.id === chatId
                                                ? {
                                                    ...chat,
                                                    messages: [...(chat.messages || []), finalMessage],
                                                }
                                                : chat
                                        )
                                    );
                                    break;

                                case 'error':
                                    throw new Error(data.error);
                                default:
                                    console.warn('Unknown data type:', data.type);
                                    break;
                            }
                        } catch (error) {
                            console.error('Error parsing stream:', error);
                            showToast({
                                type: 'error',
                                message: 'Error parsing response',
                            });
                        }
                    }
                }

            } catch (error) {
                console.error('Error:', error);
                showToast({
                    type: 'error',
                    message: 'Failed to send message. Please try again.',
                });
            } finally {
                setIsLoading(false);
                setPrompt('');
                setSelectedImage(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        },
        [prompt, isLoading, currentChat, selectedImage, chats, showToast]
    );

    // --- Image Upload Handlers ---
    const handleImageUpload = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast({
                type: 'error',
                message: 'File size should be less than 5MB',
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axiosInstance.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
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
    }, [prompt, handleSubmit]);

    // --- Chat Management Functions ---
    const createNewChat = useCallback(() => {
        const tempNewChat = {
            id: `temp-${Date.now()}`,
            title: '',
            category: 'General',
            messages: [],
            isTemp: true,
        };
        setTempChat(tempNewChat);
        setCurrentChat(tempNewChat);
        setSidebarOpen(false);
        router.replace('/ai-chat');
    }, [router]);

    const loadChat = useCallback(async (chat) => {
        if (chat.id === currentChat?.id) return;

        try {
            // Fetch the full chat data from the backend
            const response = await axiosInstance.get(`/chats/${chat.id}`);
            const fullChat = response.data.chat;

            setCurrentChat(fullChat);
            setSidebarOpen(false);
            router.push(`/chat/${chat.id}`, { scroll: false });
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error loading chat:', error);
            showToast({ type: 'error', message: 'Failed to load chat' });
        }
    }, [currentChat, router, scrollToBottom]);

    useEffect(() => {
        const handlePopState = async () => {
            const pathSegments = window.location.pathname.split('/');
            const chatId = pathSegments[pathSegments.length - 1];

            if (chatId && chatId !== 'chat') {
                try {
                    const response = await axiosInstance.get(`/chats/${chatId}`);
                    setCurrentChat(response.data.chat);
                } catch (error) {
                    console.error('Error loading chat:', error);
                    showToast({ type: 'error', message: 'Failed to load chat' });
                }
            } else {
                setCurrentChat(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        const chatId = params?.chatId;
        if (
            chatId &&
            chats.length > 0 &&
            (!currentChat || currentChat.id !== chatId)
        ) {
            const chat = chats.find((c) => c.id === chatId);
            if (chat) {
                setCurrentChat(chat);
                setTimeout(scrollToBottom, 100);
            }
        }
    }, [params?.chatId, chats, currentChat, scrollToBottom]);

    const deleteChat = async (chatId) => {
        try {
            const response = await axiosInstance.delete(`/chats/${chatId}`);
            setChats((prev) => prev.filter((chat) => chat.id !== chatId));
            if (currentChat?.id === chatId) {
                setCurrentChat(null);
            }
            router.push('/ai-chat');
            showToast({ type: 'success', message: response.data.message });
        } catch (error) {
            console.error('Error deleting chat:', error);
            showToast({ type: 'error', message: 'Failed to delete chat' });
        }
    };

    // --- Message Edit Handler ---
    const handleMessageEdit = useCallback(
        async (messageId, newContent) => {
            if (!currentChat) {
                showToast({ type: 'error', message: 'No active chat found' });
                return;
            }

            setProcessingMessageId(messageId);

            try {
                const editedMessageIndex = currentChat.messages.findIndex(
                    (msg) => msg.id === messageId
                );

                const updatedMessages = [...currentChat.messages];
                updatedMessages[editedMessageIndex] = {
                    ...updatedMessages[editedMessageIndex],
                    content: newContent,
                };

                const updatedChat = { ...currentChat, messages: updatedMessages };
                setCurrentChat(updatedChat);

                // API call to edit the message and get AI response
                const response = await axiosInstance.put(
                    '/messages',
                    { messageId, newContent },
                    { responseType: 'text' }
                );


                const lines = response.data.split('\n').filter((line) => line.trim() !== '');
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
                                    await new Promise((resolve) => setTimeout(resolve, 30));
                                    break;

                                case 'done':
                                    setStreamingMessage('');

                                    const nextAssistantMessageIndex =
                                        currentChat.messages.findIndex(
                                            (msg, index) =>
                                                msg.role === 'assistant' &&
                                                editedMessageIndex < index
                                        );

                                    const finalMessages =
                                        nextAssistantMessageIndex !== -1
                                            ? [
                                                ...updatedMessages.slice(0, nextAssistantMessageIndex),
                                                {
                                                    id: updatedMessages[nextAssistantMessageIndex].id,
                                                    content: data.content,
                                                    role: 'assistant',
                                                    images: data.url ? data.url : [],
                                                },
                                                ...updatedMessages.slice(nextAssistantMessageIndex + 1),
                                            ]
                                            : updatedMessages;

                                    setCurrentChat((prev) => ({
                                        ...prev,
                                        messages: finalMessages,
                                    }));

                                    setChats((prev) =>
                                        prev.map((chat) =>
                                            chat.id === currentChat.id
                                                ? {
                                                    ...chat,
                                                    messages: finalMessages,
                                                }
                                                : chat
                                        )
                                    );

                                    showToast({
                                        type: 'success',
                                        message: 'Message updated successfully',
                                    });
                                    break;

                                case 'error':
                                    throw new Error(data.error);
                                default:
                                    console.warn('Unknown data type:', data.type);
                                    break;
                            }
                        } catch (error) {
                            console.error('Error parsing stream:', error);
                            showToast({
                                type: 'error',
                                message: 'Error processing response',
                            });
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
        },
        [currentChat, chats, setStreamingMessage, showToast]
    );

    // --- Render ---
    return (
        <div className={`h-screen w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 transition-all duration-300 ${isExpanded ? 'p-0' : 'p-4'
            }`}>
            <div className={`h-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex transition-all duration-300 ${isExpanded ? 'scale-100' : 'scale-98 hover:scale-99'
                }`}>
                <ChatSidebar
                    chats={chats}
                    currentChat={currentChat}
                    onCreateNewChat={createNewChat}
                    onLoadChat={loadChat}
                    isSidebarOpen={isSidebarOpen}
                    onSetSidebarOpen={setSidebarOpen}
                    timeSince={timeSince}
                    tempChat={tempChat}
                />

                <div className="flex-1 flex flex-col h-full relative">
                    <ChatTopBar
                        currentChat={currentChat}
                        isExpanded={isExpanded}
                        onDeleteChat={deleteChat}
                        onSetIsExpanded={setIsExpanded}
                        onSetSidebarOpen={setSidebarOpen}
                    />

                    <ChatMessageList
                        messages={currentChat?.messages || []}
                        streamingMessage={streamingMessage}
                        isLoading={isLoading}
                        messagesEndRef={messagesEndRef}
                        onEditMessage={handleMessageEdit}
                        onDeleteMessage={(messageId) => {
                            const updatedMessages = currentChat.messages.filter(
                                (msg) => msg.id !== messageId
                            );
                            const updatedChat = {
                                ...currentChat,
                                messages: updatedMessages,
                            };
                            setCurrentChat(updatedChat);
                            const updatedChats = chats.map((chat) =>
                                chat.id === currentChat.id ? updatedChat : chat
                            );
                            setChats(updatedChats);
                        }}
                        processingMessageId={processingMessageId}
                    />

                    <ChatInputArea
                        prompt={prompt}
                        selectedImage={selectedImage}
                        textDirection={textDirection}
                        isLoading={isLoading}
                        onSetPrompt={setPrompt}
                        onSetSelectedImage={setSelectedImage}
                        onSubmitMessage={handleSubmit}
                        onImageUpload={handleImageUpload}
                        fileInputRef={fileInputRef}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatArea;