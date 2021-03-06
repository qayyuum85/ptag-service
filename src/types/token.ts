import { User } from '@prisma/client';
import { Request } from 'express';
import { Role } from '../controllers/userRole';

export interface UserTokenData {
    token: string;
    expiresIn: number;
}

export interface AccessTokenData {
    userId: number;
    email: string;
    roles: Role[];
}

export interface RefreshTokenData {
    userId: number;
}

export interface RequestWithUser extends Request {
    user: User;
}
