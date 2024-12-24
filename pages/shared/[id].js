import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { Shield, Clock, AlertCircle, Check, Copy } from 'lucide-react';
import ChatTopBar from '@/components/ChatTopBar';
import { Button } from '@/ui_template/ui/button';
import { Alert, AlertDescription } from '@/ui_template/ui/alert';
import Link from 'next/link';

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
    const [copyStatus, setCopyStatus] = useState({});

    useEffect(() => {
        const cookies = parseCookies();
        setIsAuthenticated(!!cookies.token);
    }, []);

    const handleLogin = () => {
        const currentPath = window.location.pathname;
        localStorage.setItem('redirectAfterLogin', currentPath);
        router.push('/');
    };

    const handleCopy = async (content, index) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopyStatus(prev => ({ ...prev, [index]: true }));
            setTimeout(() => setCopyStatus(prev => ({ ...prev, [index]: false })), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const MessageContent = ({ content, role, timestamp }) => {
        const isUser = role === 'user';
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
            <div className="w-full max-w-4xl mx-auto my-4">
                <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-9 h-9 rounded-full shrink-0 overflow-hidden
                        ${isUser ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-white'}`}>
                        {isUser ? (
                            <Image
                                src="/Images/U-Icon.jpeg"
                                alt="User Avatar"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                priority
                            />
                        ) : (
                            <Image
                                src="/Images/A-Icon.jpeg"
                                alt="Assistant Avatar"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                priority
                            />
                        )}
                    </div>

                    <div className="group relative flex-1 max-w-[80%]">
                        <div className={`absolute top-4 w-4 h-4 rotate-45
                            ${isUser
                                ? '-left-2 bg-blue-50 dark:bg-indigo-950 border-l border-t border-blue-200/50 dark:border-indigo-800/50'
                                : '-right-2 bg-gray-50 dark:bg-gray-900 border-r border-t border-gray-200/50 dark:border-gray-700/50'
                            }`} />

                        <div className={`rounded-lg shadow-sm p-4
                            ${isUser
                                ? 'bg-blue-50 dark:bg-indigo-950 border border-blue-200/50 dark:border-indigo-800/50'
                                : 'bg-gray-50 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50'
                            }`}>
                            {parts.map((part, index) => (
                                part.type === 'code' ? (
                                    <div key={index} className="relative my-2 rounded-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                                        <div className="flex items-center justify-between px-4 py-2 bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Code</span>
                                            <button
                                                onClick={() => handleCopy(part.content, index)}
                                                className="p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                                            >
                                                {copyStatus[index] ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        <pre className="p-4 text-sm overflow-x-auto bg-gray-50/50 dark:bg-gray-900/50">
                                            <code>{part.content}</code>
                                        </pre>
                                    </div>
                                ) : (
                                    <div
                                        key={index}
                                        className="text-sm leading-7 my-2 break-words markdown-content"
                                        style={{
                                            textAlign: part.direction === 'rtl' ? 'right' : 'left',
                                            direction: part.direction
                                        }}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => (
                                                    <p className="mb-4 whitespace-pre-wrap" {...props} />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul className="list-disc list-inside mb-4" {...props} />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol className="list-decimal list-inside mb-4" {...props} />
                                                ),
                                                li: ({ node, ...props }) => (
                                                    <li className="mb-2" {...props} />
                                                ),
                                                strong: ({ node, ...props }) => (
                                                    <strong className="font-bold" {...props} />
                                                ),
                                                em: ({ node, ...props }) => (
                                                    <em className="italic" {...props} />
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
            />

            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-5xl mx-auto space-y-6">
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
                <div class="mt-7 h-10 flex justify-center items-center">
                    <div class="relative inline-flex group">
                        <div
                            class="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt">
                        </div>
                        <Link href='/ai-chat'
                            className="relative h-12 inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                            Let’s Talk!
                        </Link>
                    </div>
                </div>
            </div>

            {!isAuthenticated && (
                <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-blue-100 dark:border-blue-800">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Create your own AI conversations and continue this chat by signing in
                        </p>
                        <Button
                            onClick={handleLogin}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200"
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