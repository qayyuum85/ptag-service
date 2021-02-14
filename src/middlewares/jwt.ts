import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { RequestHandler } from 'express';
import { AccessTokenData } from '../types/token';
import { PrismaClient } from '@prisma/client';
import { InvalidTokenException, MissingTokenException } from '../models/Error';

config();
const prisma = new PrismaClient();

export const jwtMiddleware: RequestHandler = async (req, _res, next) => {
    const cookies = req.cookies;
    if (cookies && cookies.Authorization) {
        const secret = process.env.JWT_ACCESS_SECRET!;
        try {
            const verificationResponse = jwt.verify(cookies.Authorization, secret) as AccessTokenData;
            const id = verificationResponse.userId;
            const user = await prisma.user.findFirst({
                where: {
                    id,
                },
            });
            if (user) {
                req.user = user;
                next();
            } else {
                next(new InvalidTokenException());
            }
        } catch (error) {
            next(new InvalidTokenException());
        }
    } else {
        next(new MissingTokenException());
    }
};

export default jwtMiddleware;
