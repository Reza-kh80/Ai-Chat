import React from 'react';
import MessageBubble from '@/components/MessageBubble';
import MessageLoader from './MessageLoader';
import { ScrollArea } from '@/ui_template/ui/scroll-area';

const ChatMessageList = ({ messages, streamingMessage, isLoading, messagesEndRef, onEditMessage, onDeleteMessage, processingMessageId }) => {
    return (
        <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        onEdit={onEditMessage}
                        onDelete={onDeleteMessage}
                        isProcessing={processingMessageId === message.id}
                    />
                ))}
                {streamingMessage && (
                    <MessageBubble
                        message={{
                            role: 'assistant',
                            content: streamingMessage,
                            id: 'streaming',
                        }}
                    />
                )}
                {isLoading && <MessageLoader />}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    );
};

export default ChatMessageList;