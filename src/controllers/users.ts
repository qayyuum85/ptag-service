import { RequestHandler } from 'express';
import { IsDefined, IsEmail, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PrismaClient, User, UserRole } from '@prisma/client';
import { Role } from './userRole';
import { ArrayContainsOneOf } from '../helper/ArrayContainsOneOf';
import { BaseUser, CreateUserBodyI, UserResponse } from '../types/user';

const prisma = new PrismaClient({
    errorFormat: 'pretty',
    log: ['query', 'info', `warn`, `error`],
});

const UserColumnSelection = {
    id: true,
    firstName: true,
    lastName: true,
    address: true,
    email: true,
    phone: true,
    UserRole: true,
};

const mapUserResponse = (
    user: BaseUser & {
        id: number;
        UserRole: UserRole[];
    }
): UserResponse => {
    const { id, firstName, lastName, email, phone, address } = user;
    return {
        id,
        firstName,
        lastName,
        email,
        phone,
        address,
        userRole: user.UserRole.map((r) => r.role as Role),
    };
};

class CreateUserBody implements CreateUserBodyI {
    @IsDefined()
    firstName: string;

    @IsDefined()
    lastName: string;

    @IsDefined()
    @IsEmail()
    email: string;

    @IsDefined()
    address: string;

    @IsDefined()
    phone: string;

    @IsDefined({
        each: true,
    })
    @ArrayContainsOneOf({ containsThis: Object.keys(Role) })
    role: Role[];

    constructor(firstName: string, lastName: string, email: string, address: string, phone: string, role: Role[]) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.address = address;
        this.phone = phone;
        this.role = role;
    }

    getDbObject() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            address: this.address,
            email: this.email,
            phone: this.phone,
            role: this.role,
        };
    }
}

export const createUser: RequestHandler<any, User | unknown, CreateUserBodyI> = async (req, res, _) => {
    try {
        const reqBody = plainToClass(CreateUserBody, req.body);
        await validateOrReject(reqBody);

        const { firstName, address, email, lastName, phone, role } = reqBody.getDbObject();
        const result = await prisma.user.create({
            data: {
                firstName,
                address,
                email,
                lastName,
                phone,
                UserRole: {
                    create: role.map((r) => {
                        return { role: r as Role };
                    }),
                },
            },
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json(error);
    }
};

export const getUsers: RequestHandler<any, UserResponse[]> = async (_, res) => {
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
    Partial<Omit<CreateUserBodyI, 'email'>>
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
