import { User } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { RequestHandler } from 'express';
import { mapUserResponse, UserColumnSelection, UserRegisterDto } from '../models/Users';
import { PrismaClient } from '@prisma/client';
import { UserRegisterDtoI } from '../types/user';
import { Role } from './userRole';
import { generateCookies } from '../helper/cookie';
import { AccessTokenData } from '../types/token';

const prisma = new PrismaClient();

export const registerUser: RequestHandler<any, User | unknown, UserRegisterDtoI> = async (req, res, _) => {
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

        const transformedUser = mapUserResponse(result);
        const userData: AccessTokenData = {
            userId: transformedUser.id,
            email: transformedUser.email,
            roles: transformedUser.userRole,
        };
        const cookies = await generateCookies(userData);
        res.setHeader('Set-Cookie', cookies);
        res.status(201).json(mapUserResponse(result));
    } catch (error: any) {
        res.status(400).json(error);
    }
};
