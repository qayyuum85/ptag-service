import { RequestHandler } from 'express';
import { Users } from '../models/Users';

const users: Users[] = [];

export const createUser: RequestHandler = (req, res, next) => {
    const text = (req.body as { text: string }).text;

    const newUser = new Users(Math.random().toString(), text);

    users.push(newUser);

    res.status(201).json({ message: 'Created the user', createdUser: newUser });
};

export const getUser: RequestHandler<{ id: string }, { users: Users[] }, { text: string }> = (req, res, next) => {
    const body = req.params.id;
    res.status(200).json({ users: users });
};
