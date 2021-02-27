import jwt from 'jsonwebtoken';
import { AccessTokenData, RefreshTokenData, UserTokenData } from '../types/token';
import { deleteRefreshToken, getRefreshToken, setRefreshToken } from './redis';
import bcrypt from 'bcrypt';
import { UnauthorizedException } from '../models/Error';
import { config } from 'dotenv';
import { Role } from '../controllers/userRole';

config();

export const generateCookies = async (userData: AccessTokenData): Promise<[string, string]> => {
    const accessToken = createAccessToken(userData);
    const refreshToken = await createRefreshToken(userData);

    const accessCookie = createAccessCookie(accessToken);
    const refreshCookie = createRefreshCookie(refreshToken);

    return [accessCookie, refreshCookie];
};

export const removeCookies = async (userId: number) => {
    await deleteRefreshToken(userId);
    return ['Authorization=; HttpOnly; Path=/; Max-Age=0', 'Refresh=; HttpOnly; Path=/; Max-Age=0'];
};

export const getCookiesData = async (refreshToken: string) => {
    const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    if (!decodedToken) {
        throw new UnauthorizedException();
    }

    const dbUser = await getRefreshToken((decodedToken as RefreshTokenData).userId);
    if (!dbUser) {
        throw new UnauthorizedException();
    }

    const isHashedTokenVerified = await bcrypt.compare(refreshToken, dbUser.hashedToken);
    if (!isHashedTokenVerified) {
        throw new UnauthorizedException();
    }

    const userData: AccessTokenData = {
        userId: Number(dbUser.userId),
        email: dbUser.email,
        roles: dbUser.roles.split(',') as Role[],
    };

    return userData;
};

const createAccessToken = (user: AccessTokenData): UserTokenData => {
    const expiresIn = Number(process.env.JWT_ACCESS_EXPIRY!);
    const secret = process.env.JWT_ACCESS_SECRET!;
    const dataStoredInToken: AccessTokenData = {
        userId: user.userId,
        roles: user.roles,
        email: user.email,
    };

    return {
        expiresIn,
        token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
};

const createAccessCookie = (tokenData: UserTokenData) => {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
};

const createRefreshCookie = (tokenData: string) => {
    return `Refresh=${tokenData}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_SECRET!}`;
};

const createRefreshToken = async (user: AccessTokenData) => {
    const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRY!),
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await setRefreshToken(user, hashedRefreshToken, Number(process.env.JWT_REFRESH_EXPIRY!));

    return refreshToken;
};
