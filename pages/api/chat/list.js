// pages/api/chat/list.js
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await verifyToken(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

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
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}