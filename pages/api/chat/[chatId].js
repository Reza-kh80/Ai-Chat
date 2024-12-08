// pages/api/chat/[chatId].js
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { chatId } = req.query;

    try {
        const user = await verifyToken(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        switch (req.method) {
            case 'GET':
                const chat = await prisma.chat.findFirst({
                    where: {
                        id: chatId,
                        userId: user.id
                    },
                    include: {
                        messages: true
                    }
                });

                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
                }

                return res.status(200).json(chat);

            case 'DELETE':
                await prisma.chat.deleteMany({
                    where: {
                        id: chatId,
                        userId: user.id
                    }
                });

                return res.status(200).json({ message: 'Chat deleted' });

            default:
                res.setHeader('Allow', ['GET', 'DELETE']);
                return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}