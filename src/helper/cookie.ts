import jwt from 'jsonwebtoken';
import { AccessTokenData, UserTokenData } from '../types/token';
import { deleteRefreshToken, setRefreshToken } from './redis';
import bcrypt from 'bcrypt';

export const generateCookies = async (userData: AccessTokenData): Promise<[string, string]> => {
    const accessToken = createAccessToken(userData);
    const refreshToken = await createRefreshToken(userData);

    const accessCookie = createAccessCookie(accessToken);
    const refreshCookie = createRefreshCookie(refreshToken);

    return [accessCookie, refreshCookie];
};

export const removeCookies = async (userId: number) => {
    await deleteRefreshToken(userId);
    return ['Authentication=; HttpOnly; Path=/; Max-Age=0', 'Refresh=; HttpOnly; Path=/; Max-Age=0'];
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
