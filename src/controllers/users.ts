import { RequestHandler } from 'express';
import { PrismaClient, User } from '@prisma/client';
import { createUserRole, getUserRole, Role } from './userRole';

const prisma = new PrismaClient({
    errorFormat: 'pretty',
    log: ['query', 'info', `warn`, `error`],
});

type ReqBody = {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phone: string;
    role: Role;
};

export const createUser: RequestHandler<any, User | unknown, ReqBody> = async (req, res, next) => {
    try {
        const result = await prisma.user.create({
            data: {
                ...req.body,
            },
        });

        await createUserRole(result.id, req.body.role);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({message: <Error>error.message});
    }
};

export const getUsers: RequestHandler<any, User[]> = async (req, res) => {
    const allUsers = await prisma.user.findMany({});
    res.json(allUsers);
};

export const getUserById: RequestHandler<{ id: number }, User | unknown> = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId),
            },
        });

        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }

        const userRole = await getUserRole(user.id);
        res.status(200).json({ ...user, roles: userRole?.map((r) => r.role) });
    } catch (error: unknown) {
        res.status(500).json(error);
    }
};

export const updateUser: RequestHandler<{ id: string }, User | unknown, Partial<Omit<ReqBody, 'email'>>> = async (
    req,
    res
) => {
    try {
        const userId = req.params.id;
        const user = await prisma.user.update({
            where: { id: Number(userId) },
            data: {
                ...req.body,
            },
        });
        res.status(200).json(user);
    } catch (error: unknown) {
        res.status(400).json(error);
    }
};
