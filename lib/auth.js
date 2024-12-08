import jwt from 'jsonwebtoken';

export const verifyToken = async (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        return null;
    }
};