import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserFromToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
    } catch (error) {
        return null;
    }
}

export default async function handler(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const user = await getUserFromToken(token);
    if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    switch (req.method) {
        case 'POST':
            try {
                const { chatId, message } = req.body;

                let chat;
                if (chatId) {
                    // If chatId exists, get existing chat
                    chat = await prisma.chat.findUnique({
                        where: { id: chatId },
                        include: { messages: true }
                    });
                } else {
                    // Create new chat only if it's the first message
                    chat = await prisma.chat.create({
                        data: {
                            title: message.content.slice(0, 25) + (message.content.length > 25 ? '...' : ''),
                            category: 'General',
                            userId: user.id,
                        },
                        include: { messages: true } // Include messages in the response
                    });
                }

                // Save user message
                const userMessage = await prisma.message.create({
                    data: {
                        chatId: chat.id,
                        content: message.content,
                        role: 'user',
                        image: message.image || null
                    }
                });

                // Set SSE headers
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                });

                // Send the initial chat data
                res.write(`data: ${JSON.stringify({
                    type: 'init',
                    chat: { ...chat, messages: [...chat.messages, userMessage] }
                })}\n\n`);

                // Prepare messages for AI
                const messageHistory = [...chat.messages, userMessage]
                    .map(msg => ({
                        role: msg.role,
                        content: msg.image
                            ? `${msg.content}\n[Attached image: ${msg.image.substring(0, 100)}...]`
                            : msg.content
                    }));

                // Make request to AI API
                const aiResponse = await fetch(process.env.NEXT_PUBLIC_AI_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: process.env.NEXT_PUBLIC_AI_MODEL,
                        messages: messageHistory,
                        stream: true
                    })
                });

                if (!aiResponse.ok) {
                    throw new Error(`AI API responded with status: ${aiResponse.status}`);
                }

                const reader = aiResponse.body.getReader();
                let fullContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = new TextDecoder().decode(value);
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        if (line.includes('[DONE]')) continue;
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.choices?.[0]?.delta?.content) {
                                    const content = data.choices[0].delta.content;
                                    fullContent += content;

                                    // Stream each chunk to the client
                                    res.write(`data: ${JSON.stringify({
                                        type: 'stream',
                                        content,
                                        chatId: chat.id
                                    })}\n\n`);
                                }
                            } catch (error) {
                                console.error('Error parsing stream:', error);
                            }
                        }
                    }
                }

                // Save the complete AI response
                const aiMessage = await prisma.message.create({
                    data: {
                        chatId: chat.id,
                        content: fullContent,
                        role: 'assistant'
                    }
                });

                // Update chat's lastUpdate
                await prisma.chat.update({
                    where: { id: chat.id },
                    data: { lastUpdate: new Date() }
                });

                // Send completion message
                res.write(`data: ${JSON.stringify({
                    type: 'complete',
                    message: aiMessage,
                    chatId: chat.id
                })}\n\n`);

                res.write('data: [DONE]\n\n');
                res.end();

            } catch (error) {
                console.error('API error:', error);
                res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
                res.end();
            }
            break;

        case 'GET':
            try {
                const chats = await prisma.chat.findMany({
                    where: {
                        userId: user.id
                    },
                    include: {
                        messages: true
                    },
                    orderBy: {
                        lastUpdate: 'desc'
                    }
                });

                res.status(200).json(chats);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching chats', error: error.message });
            }
            break;

        case 'DELETE':
            const { chatId } = req.query; // Extract chatId from query

            if (!chatId) {
                return res.status(400).json({ message: 'Chat ID is required' });
            }

            try {
                // Delete the chat from the database
                await prisma.chat.delete({
                    where: {
                        id: parseInt(chatId), // Ensure chatId is an integer
                    }
                });

                res.status(200).json({ message: 'Chat deleted successfully' });
            } catch (error) {
                console.error('Error deleting chat:', error);
                res.status(500).json({ message: 'Failed to delete chat', error: error.message });
            }
            break;

        case 'PUT':
            const { messageId, newContent } = req.body; // Extract message ID and new content from the request body

            if (!messageId || !newContent) {
                return res.status(400).json({ message: 'Message ID and new content are required' });
            }

            try {
                // Update the message in the database
                const updatedMessage = await prisma.message.update({
                    where: { id: messageId },
                    data: { content: newContent },
                });

                // Fetch the chat to get the full message history
                res.status(200).json({ updatedMessage });
            } catch (error) {
                console.error('Error updating message:', error);
                res.status(500).json({ message: 'Failed to update message', error: error.message });
            }
            break;

        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
}

export const config = {
    api: {
        responseLimit: false,
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};