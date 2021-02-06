import { PrismaClient } from '@prisma/client';

export enum Role {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    STUDENT = 'STUDENT',
    PARENT = 'PARENT',
}

const prisma = new PrismaClient();

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
