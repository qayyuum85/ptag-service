import { NextFunction, Request, RequestHandler, Response } from 'express';
import { IsDefined, IsEmail, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PrismaClient, User, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Role } from './userRole';
import { ArrayContainsOneOf } from '../helper/ArrayContainsOneOf';
import { BaseUser, CreateUserBodyI as UserRegisterDtoI, UserResponse } from '../types/user';

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

class UserRegisterDto implements UserRegisterDtoI {
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

    @IsDefined()
    password: string;

    constructor(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        address: string,
        phone: string,
        role: Role[]
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.address = address;
        this.phone = phone;
        this.role = role;
        this.password = password;
    }

    async getDto() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            address: this.address,
            email: this.email,
            phone: this.phone,
            role: this.role,
            password: await this.hashPassword(),
        };
    }

    private async hashPassword(): Promise<string> {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        return hashedPassword;
    }
}

export const createUser: RequestHandler<any, User | unknown, UserRegisterDtoI> = async (req, res, _) => {
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
            select: UserColumnSelection
        });

        res.status(201).json(mapUserResponse(result));
    } catch (error: any) {
        res.status(400).json(error);
    }
};

export const getUsers= async (_req:Request, res:Response<UserResponse[]>, _next:NextFunction) => {
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
    Partial<Omit<UserRegisterDtoI, 'email'>>
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
