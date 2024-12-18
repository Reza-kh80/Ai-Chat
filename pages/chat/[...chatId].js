import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatArea from "@/components/ChatArea";
import axiosInstance from '@/lib/axiosInstance';
import { showToast } from '@/ui_template/ui/toast';

export default function ChatPage() {
    const params = useParams();
    const [initialChat, setInitialChat] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadInitialChat = async () => {
            if (!params?.chatId) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axiosInstance.get(`/chats/${params.chatId}`);
                setInitialChat(response.data.chat);
            } catch (error) {
                console.error('Error loading chat:', error);
                showToast({
                    type: 'error',
                    message: 'Failed to load chat'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialChat();
    }, [params?.chatId]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return <ChatArea initialChat={initialChat} />;
}