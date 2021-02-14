import { NextFunction, Request, RequestHandler, Response } from 'express';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PrismaClient, User } from '@prisma/client';
import { Role } from './userRole';
import { UserRegisterDtoI, UserResponse } from '../types/user';
import { mapUserResponse, UserColumnSelection, UserRegisterDto } from '../models/Users';

const prisma = new PrismaClient({
    errorFormat: 'pretty',
    log: ['query', 'info', `warn`, `error`],
});

export const createUser: RequestHandler<any, User | unknown, UserRegisterDtoI> = async (req, res, _) => {
    try {
        const reqBody = plainToClass(UserRegisterDto, req.body);
        await validateOrReject(reqBody);

        const { firstName, address, email, lastName, phone, role, password } = await reqBody.getDto();
        const result = await prisma.user.create({
            data: {
                firstName,
                address,
                email,
                lastName,
                phone,
                password,
                UserRole: {
                    create: role.map((r) => {
                        return { role: r as Role };
                    }),
                },
            },
            select: UserColumnSelection,
        });

        res.status(201).json(mapUserResponse(result));
    } catch (error: any) {
        res.status(400).json(error);
    }
};

export const getUsers = async (_req: Request, res: Response<UserResponse[]>, _next: NextFunction) => {
    console.log('user fingerprint', _req.fingerprint);
    const allUsers = await prisma.user.findMany({
        select: UserColumnSelection,
    });

    const response: UserResponse[] = allUsers.map(mapUserResponse);
    res.json(response);
};

export const getUserById: RequestHandler<{ id: number }, UserResponse | unknown> = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId),
            },
            select: UserColumnSelection,
        });

        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }

        const response = mapUserResponse(user);
        res.status(200).json(response);
    } catch (error: unknown) {
        res.status(500).json(error);
    }
};

export const updateUser: RequestHandler<
    { id: string },
    User | unknown,
    Partial<Omit<UserRegisterDtoI, 'email'>>
> = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await prisma.user.update({
            where: { id: Number(userId) },
            data: {
                ...req.body,
            },
        });

        await prisma.userAuditTrail.create({
            data: {
                userId: Number(userId),
                fields: Object.keys(req.body),
            },
        });
        res.status(200).json(user);
    } catch (error: unknown) {
        res.status(400).json(error);
    }
};
