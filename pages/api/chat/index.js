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
            // Create new chat
            try {
                const { title, category = 'General', messages } = req.body;

                const chat = await prisma.chat.create({
                    data: {
                        title,
                        category,
                        userId: user.id,
                        messages: {
                            create: messages.map(msg => ({
                                content: msg.content,
                                role: msg.role,
                                image: msg.image || null
                            }))
                        }
                    },
                    include: {
                        messages: true
                    }
                });

                const formattedMessages = messages.map(msg => ({
                    role: msg.role,
                    content: msg.image
                        ? `${msg.content}\n[Attached image: ${msg.image.substring(0, 100)}...]`
                        : msg.content
                }));

                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');

                const aiResponse = await fetch(process.env.NEXT_PUBLIC_AI_API_URL, {
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

                const reader = aiResponse.body.getReader();
                let fullContent = '';

                try {
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
                                    if (data.choices[0]?.delta?.content) {
                                        const content = data.choices[0].delta.content;
                                        fullContent += content;

                                        // Send the chunk to the client
                                        res.write(`data: ${JSON.stringify({ content })}\n\n`);
                                    }
                                } catch (error) {
                                    console.error('Error parsing stream:', error);
                                }
                            }
                        }
                    }

                    // Save the complete response to the database
                    await prisma.message.create({
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

                    // End the stream
                    res.write('data: [DONE]\n\n');
                    res.end();
                } catch (error) {
                    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
                    res.end();
                }
            } catch (error) {
                res.status(500).json({ message: 'Error creating chat', error: error.message });
            }
            break;

        case 'GET':
            // Get all chats for user
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

        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
}

// Configure API route to handle streaming responses
export const config = {
    api: {
        responseLimit: false,
    },
};