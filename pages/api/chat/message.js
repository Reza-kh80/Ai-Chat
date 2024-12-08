// pages/api/chat/message.js
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

        const { chatId, content, role, image } = req.body;

        // Verify chat belongs to user
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                userId: user.id
            }
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const message = await prisma.message.create({
            data: {
                content,
                role,
                image,
                chatId
            }
        });

        await prisma.chat.update({
            where: { id: chatId },
            data: { lastUpdate: new Date() }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}