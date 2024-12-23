import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import ReactMarkdown from 'react-markdown';
import { Share2, Shield, Clock, AlertCircle, Check } from 'lucide-react';
import ChatTopBar from '@/components/ChatTopBar';
import { Button } from '@/ui_template/ui/button';
import { Alert, AlertDescription } from '@/ui_template/ui/alert';

const getTextDirection = (text) => {
    const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    const ltrChars = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8]/;
    return rtlChars.test(text) ? 'rtl' : ltrChars.test(text) ? 'ltr' : 'ltr';
};

const SharedChatView = ({ initialChat }) => {
    const router = useRouter();
    const { id } = router.query;
    const [chat, _] = useState(initialChat);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [copied, setCopied] = useState(false);


    useEffect(() => {
        const cookies = parseCookies();
        setIsAuthenticated(!!cookies.token);
    }, []);

    const handleLogin = () => {
        router.push(`/auth?redirect=/shared/${id}`);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCopy = async (content, index) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const MessageContent = ({ content, role, timestamp }) => {
        const textDirection = getTextDirection(content);
        const codeBlockRegex = /```[\s\S]*?```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.slice(lastIndex, match.index),
                    direction: getTextDirection(content.slice(lastIndex, match.index))
                });
            }
            parts.push({
                type: 'code',
                content: match[0].slice(3, -3),
                direction: 'ltr'
            });
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < content.length) {
            parts.push({
                type: 'text',
                content: content.slice(lastIndex),
                direction: getTextDirection(content.slice(lastIndex))
            });
        }

        return (
            <div className={`group relative flex flex-col ${role === 'user' ? 'items-end' : 'items-start'} mb-12`}>
                <div className="mb-3 flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium 
                        ${role === 'user'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                        {role === 'user' ? 'You' : 'Assistant'}
                    </span>
                    <span className="text-sm text-gray-400">
                        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div className={`flex max-w-[85%] md:max-w-[75%] lg:max-w-[65%] ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`relative flex-1 px-8 py-6 rounded-2xl shadow-sm transition-all duration-200
                        ${role === 'user'
                            ? 'bg-blue-50 dark:bg-indigo-950 border border-blue-200/50 dark:border-indigo-800/50'
                            : 'bg-gray-50 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50'
                        }`}>
                        {parts.map((part, index) => (
                            part.type === 'code' ? (
                                <div key={index} className="relative my-6 rounded-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between px-5 py-3 bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</span>
                                        <button
                                            onClick={() => handleCopy(part.content, index)}
                                            className="p-1.5 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Share2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    <pre className="p-5 text-sm leading-relaxed overflow-x-auto bg-gray-50/50 dark:bg-gray-900/50">
                                        <code>{part.content}</code>
                                    </pre>
                                </div>
                            ) : (
                                <div
                                    key={index}
                                    className="prose dark:prose-invert max-w-none prose-lg leading-relaxed"
                                    style={{
                                        direction: part.direction,
                                        textAlign: part.direction === 'rtl' ? 'right' : 'left'
                                    }}
                                >
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => (
                                                <p className="whitespace-pre-wrap mb-8 last:mb-0 leading-relaxed" {...props} />
                                            ),
                                            a: ({ node, ...props }) => (
                                                <a className={`underline decoration-2 ${role === 'user'
                                                    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                                                    : 'text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`} {...props} />
                                            ),
                                            code: ({ node, inline, ...props }) => (
                                                inline
                                                    ? <code className={`px-2 py-1 rounded ${role === 'user'
                                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                        }`} {...props} />
                                                    : null
                                            ),
                                        }}
                                    >
                                        {part.content}
                                    </ReactMarkdown>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (!chat) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-4 max-w-md w-full">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Chat Not Found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        This conversation may have been deleted or is no longer available.
                    </p>
                    <Button
                        onClick={() => router.push('/')}
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    const requiresAuth = chat.requiresAuth;

    if (requiresAuth && !isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                <div className="w-full max-w-md space-y-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            This is a private chat that requires authentication.
                        </AlertDescription>
                    </Alert>

                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-4">
                        <Shield className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Authentication Required
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Please sign in to view this protected conversation.
                        </p>
                        <Button
                            onClick={handleLogin}
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            Sign In to Continue
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            <ChatTopBar
                currentChat={chat}
                isExpanded={false}
                onDeleteChat={null}
                onSetIsExpanded={() => { }}
                onSetSidebarOpen={() => { }}
                isSharedView={true}
            >
            </ChatTopBar>

            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-5xl mx-auto space-y-10">
                    {chat.createdAt && (
                        <div className="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            Created {new Date(chat.createdAt).toLocaleDateString()}
                        </div>
                    )}
                    {chat.messages.map((message, index) => (
                        <MessageContent
                            key={index}
                            content={message.content}
                            role={message.role}
                            timestamp={message.timestamp || new Date().toISOString()}
                        />
                    ))}
                </div>
            </div>

            {!isAuthenticated && (
                <div className="p-8 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Create your own AI conversations and continue this chat by signing in
                        </p>
                        <Button
                            onClick={handleLogin}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export async function getServerSideProps(context) {
    const { id } = context.params;
    const cookies = parseCookies(context);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/${id}/public`, {
            headers: cookies.token ? {
                Authorization: `Bearer ${cookies.token}`
            } : {}
        });

        if (!response.ok) {
            return { props: { initialChat: null } };
        }

        const data = await response.json();
        const chatWithAuth = {
            ...data.chat,
            requiresAuth: data.chat.requiresAuth || false
        };

        return { props: { initialChat: chatWithAuth } };
    } catch (error) {
        console.error('Error fetching chat:', error);
        return { props: { initialChat: null } };
    }
}

export default SharedChatView;