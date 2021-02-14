import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { HttpError, InvalidTokenException, UnauthorizedException } from '../models/Error';
import { config } from 'dotenv';
import { Role } from './userRole';
import { AccessTokenData } from '../types/token';
import { generateCookies, getCookiesData, removeCookies } from '../helper/cookie';

config();

const prisma = new PrismaClient();

export const login: RequestHandler<any, any, { email: string; password: string }> = async (req, res, next) => {
    console.log(JSON.stringify(req.fingerprint));
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
        const userData: AccessTokenData = { userId: user.id, email: user.email, roles };
        const newCookies = await generateCookies(userData);
        res.setHeader('Set-Cookie', newCookies);
        res.status(200).json({ login: 'OK' });
    } catch (error: unknown) {
        next(new HttpError(500, 'Internal Error'));
    }
};

export const logout: RequestHandler = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (cookies && cookies.Refresh) {
            const userData = await getCookiesData(cookies.Refresh);
            const headers = await removeCookies(userData.userId);
            res.setHeader('Set-Cookie', headers);
            res.sendStatus(200);
            return;
        }
        next(new InvalidTokenException());
    } catch (error) {
        next(new HttpError(500, 'Internal Server Error'));
    }
};

export const refreshToken: RequestHandler = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (cookies && cookies.Refresh) {
            const userData = await getCookiesData(cookies.Refresh);
            const newCookies = await generateCookies(userData);
            res.setHeader('Set-Cookie', newCookies);
            res.status(200).json({ refresh: 'OK' });
        } else {
            next(new UnauthorizedException());
        }
    } catch (error) {
        next(new HttpError(500, `Internal Server Error`));
    }
};
