import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';

export enum Role {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    STUDENT = 'STUDENT',
    PARENT = 'PARENT',
}

const prisma = new PrismaClient();

export const handleCreateUserRole: RequestHandler<{ id: number }, any, { role: Role }> = async (req, res) => {
    const { id: userId } = req.params;
    const { role } = req.body;
    const response = await createUserRole(Number(userId), role);

    if (!response) {
        res.status(400).json({ success: false });
        return;
    }
    res.status(200).json({ success: true });
};

export const createUserRole = async (userId: number, role: Role) => {
    try {
        const result = await prisma.userRole.create({
            data: {
                role,
                userId: userId,
            },
        });
        return result;
    } catch (error: unknown) {
        return null;
    }
};

export const getUserRole = async (userId: number) => {
    try {
        const result = await prisma.userRole.findMany({
            select: { role: true },
            where: {
                userId,
            },
        });
        return result;
    } catch (error: unknown) {
        return null;
    }
};
