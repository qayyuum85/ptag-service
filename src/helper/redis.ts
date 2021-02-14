import { Tedis } from 'tedis';
import { AccessTokenData } from '../types/token';

const client = new Tedis({
    host: '127.0.0.1',
    port: 6379,
});

client.on('connect', () => {
    console.log(`Redis connected at port ${6379}`);
});

export const setRefreshToken = async (user: AccessTokenData, hashedToken: string, expiry: number) => {
    const key = `user:${user.userId}`;

    const setResult = await client.hmset(key, {
        hashedToken,
        userId: user.userId,
        email: user.email,
        roles: user.roles.join(','),
    });
    const expireResult = await client.expire(key, expiry);

    console.log('redis set', setResult, expireResult);
};

export const deleteRefreshToken = async (userId: number) => {
    const key = `user:${userId}`;
    await client.del(key);
};

export const getRefreshToken = async (userId: number) => {
    const key = `user:${userId}`;
    return await client.hgetall(key);
};

export default client;
