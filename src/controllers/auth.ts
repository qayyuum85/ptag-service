import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { HttpError } from '../models/Error';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { Role } from './userRole';
import { DataStoredInToken, UserTokenData } from '../types/token';

config();

const prisma = new PrismaClient();

export const login: RequestHandler<any, any, { email: string; password: string }> = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                email,
            },
            select: {
                id: true,
                password: true,
                email: true,
                UserRole: true,
            },
        });

        if (!user) {
            next(new HttpError(400, 'Invalid username or password'));
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            next(new HttpError(400, 'Invalid username or password'));
            return;
        }

        const roles = user.UserRole.map((ur) => ur.role as Role);
        const tokenData = createToken({ id: user.id, email: user.email, roles });
        res.setHeader('Set-Cookie', createCookie(tokenData));
        res.status(200).json({ login: 'OK' });
    } catch (error: unknown) {
        next(new HttpError(500, 'Internal Error'));
    }
};

export const logout: RequestHandler = (_req, res) => {
    res.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    res.sendStatus(200);
};

const createToken = (user: { id: number; email: string; roles: Role[] }): UserTokenData => {
    const expiresIn = 60 * 60;
    const secret = process.env.JWT_TOKEN!;
    const dataStoredInToken: DataStoredInToken = {
        userId: user.id,
        roles: user.roles,
        email: user.email
    };

    return {
        expiresIn,
        token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
};

const createCookie = (tokenData: UserTokenData) => {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
};
