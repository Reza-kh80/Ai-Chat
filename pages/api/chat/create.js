// pages/api/chat/create.js
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await verifyToken(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { title, category, messages } = req.body;

        const chat = await prisma.chat.create({
            data: {
                title,
                category,
                userId: user.id,
                messages: {
                    create: messages.map(msg => ({
                        role: msg.role,
                        content: msg.content,
                        image: msg.image || null
                    }))
                }
            },
            include: {
                messages: true
            }
        });

        res.status(201).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}